use bollard::Docker;
use bollard::errors::Error;
use bollard::container::{Config, CreateContainerOptions, InspectContainerOptions, ListContainersOptions, LogOutput, RemoveContainerOptions};
use std::collections::HashMap;
use bollard::exec::{CreateExecOptions, StartExecResults};
use std::cmp::Ordering;
use bollard::models::HostConfig;
use tokio::io::AsyncWriteExt;
use futures_util::StreamExt;
use tauri::Runtime;
use crate::maybe;

pub struct DockerState {
    pub docker: Result<Docker, Error>,
}

pub struct DockerRunResult {
    pub std_out: Option<String>,
    pub std_err: Option<String>,
}

pub async fn docker_run<R: Runtime>(docker: &Docker, cmd: Vec<&str>, std_in: Option<String>, app_handle: tauri::AppHandle<R>) -> Result<DockerRunResult, String> {
    let image = crate::image::get_latest_downloaded_comby_image(docker).await?;

    let container_config = Config {
        image: Some(image.as_str()),
        tty: Some(false),
        attach_stderr: Some(false),
        attach_stdout: Some(false),
        entrypoint: Some(vec!["tail", "-f", "/dev/null"]), // keep container running
        ..Default::default()
    };
    println!("checking for existing container");
    let container_name = "/gui4comby-server".to_string();
    let existing_container = maybe::maybe(docker.list_containers(Some(ListContainersOptions::<String> {
        all: true,
        filters: HashMap::from([
            ("name".to_string(), vec![container_name.clone()])
        ]),
        ..Default::default()
    })).await)?;

    let mut container_started = false;

    let id = match existing_container.len() {
        0 => {
            println!("creating a container for use");
            crate::server_log(&app_handle, format!("Creating container {} to run commands with", container_name));
            maybe::maybe(docker
                .create_container::<&str, &str>(Some(CreateContainerOptions { name: "gui4comby-server" }), container_config)
                .await)?.id
        },
        _ => {
            println!("found an existing container for use");
            container_started = existing_container.get(0).as_ref().unwrap().state.as_ref().unwrap().eq_ignore_ascii_case("running");
            existing_container.get(0).unwrap().id.as_ref().unwrap().to_string()
        }
    };

    if container_started == false {
        crate::server_log(&app_handle, "Starting container".to_string())
    }
    println!("starting container");
    maybe::maybe(docker.start_container::<String>(&id, None).await)?;


    println!("execing container");
    crate::server_log(&app_handle, format!("Docker Run\n$ {}", cmd.join(" ")));
    let exec = maybe::maybe(docker
        .create_exec(
            &id,
            CreateExecOptions {
                attach_stdout: Some(true),
                attach_stderr: Some(true),
                attach_stdin: Some(true),
                cmd: Some(cmd),
                ..Default::default()
            },
        )
        .await)?.id;

    let start_result = maybe::maybe(docker.start_exec(&exec, None).await)?;

    println!("start_exec_result: {:?}", &start_result);
    let mut std_out: String = "".to_string();
    let mut std_err: String = "".to_string();

    if let StartExecResults::Attached { mut output, mut input } = start_result {
        println!("Attached");
        if std_in.is_some() {
            println!("Writing stdin");
            maybe::maybe(input.write_all(format!("{}", std_in.unwrap()).as_bytes()).await)?;
            maybe::maybe(input.flush().await)?;
            maybe::maybe(input.shutdown().await)?;
        }

        while let Some(Ok(msg)) = output.next().await {
            match msg {
                LogOutput::StdOut { message } => std_out.push_str( String::from_utf8_lossy(&message ).as_ref() ),
                LogOutput::StdErr { message } => std_err.push_str( String::from_utf8_lossy(&message ).as_ref() ),
                LogOutput::Console { message } => println!("console: {:?}", String::from_utf8_lossy(&message)),
                _ => ()
            }
        }
    } else {
        unreachable!();
    }
    println!("exec done");

    let empty = "".to_string();
    Ok(DockerRunResult {
        std_out: match std_out.cmp(&empty) != Ordering::Equal {
            true => Some(std_out),
            false => None
        },
        std_err: match std_err.cmp(&empty) != Ordering::Equal {
            true => Some(std_err),
            false => None
        }
    })
}

pub async fn docker_run_mnt<R: Runtime>(docker: &Docker, tab_id: String, host_path: String,  cmd: Vec<&str>, app_handle: tauri::AppHandle<R>) -> Result<DockerRunResult, String> {
    let image = crate::image::get_latest_downloaded_comby_image(docker).await?;
    let binding:String = format!("{}:/mnt/source", host_path);
    let container_config = Config {
        image: Some(image.as_str()),
        tty: Some(false),
        attach_stderr: Some(false),
        attach_stdout: Some(false),
        entrypoint: Some(vec!["tail", "-f", "/dev/null"]), // keep container running
        host_config: Some(HostConfig {
           binds: Some(vec![binding.clone()]),
            ..Default::default()
        }),
        ..Default::default()
    };
    let container_name = format!("gui4comby-server-{}", tab_id);
    println!("checking for existing container {}", &container_name);
    let existing_container = maybe::maybe(docker.list_containers(Some(ListContainersOptions::<String> {
        all: true,
        filters: HashMap::from([
            ("name".to_string(), vec![container_name.clone()])
        ]),
        ..Default::default()
    })).await)?;

    let mut container_started = false;

    let id = match existing_container.len() {
        0 => {
            println!("creating a container for use");
            crate::server_log(&app_handle, format!("Creating container {} to run commands with", container_name));
            maybe::maybe(docker
                .create_container::<&str, &str>(Some(CreateContainerOptions { name: &container_name }), container_config)
                .await)?.id
        },
        _ => {
            println!("Inspecting container {}", &container_name);
            // get container info and inspect bindings, if host patch matches, we can continue, otherwise we have destroy and recreate
            let inspection_response = maybe::maybe(docker.inspect_container(&container_name, None).await)?;
            match inspection_response.host_config.is_none()
                || inspection_response.host_config.as_ref().unwrap().binds.is_none()
                || inspection_response.host_config.as_ref().unwrap().binds.as_ref().unwrap().contains(&binding) == false {
                true => {
                    println!("Existing container {} is not compatible, recreating", container_name);
                    crate::server_log(&app_handle, format!("Existing container {} is not compatible, recreating", container_name));
                    maybe::maybe(docker.remove_container(&container_name, Some(RemoveContainerOptions {
                        force: true,
                        ..Default::default()
                    })).await)?;
                    maybe::maybe(docker
                        .create_container::<&str, &str>(Some(CreateContainerOptions { name: &container_name }), container_config)
                        .await)?.id
                },
                false => {
                    container_started = existing_container.get(0).as_ref().unwrap().state.as_ref().unwrap().eq_ignore_ascii_case("running");
                    existing_container.get(0).unwrap().id.as_ref().unwrap().to_string()
                }
            }

        }
    };

    if container_started == false {
        crate::server_log(&app_handle, "Starting container".to_string())
    }
    println!("starting container");
    maybe::maybe(docker.start_container::<String>(&id, None).await)?;

    println!("execing container");
    crate::server_log(&app_handle, format!("Docker Run\n$ {}", cmd.join(" ")));
    let exec = maybe::maybe(docker
        .create_exec(
            &id,
            CreateExecOptions {
                attach_stdout: Some(true),
                attach_stderr: Some(true),
                attach_stdin: Some(false),
                cmd: Some(cmd),
                ..Default::default()
            },
        )
        .await)?.id;

    let start_result = maybe::maybe(docker.start_exec(&exec, None).await)?;

    println!("start_exec_result: {:?}", &start_result);
    let mut std_out: String = "".to_string();
    let mut std_err: String = "".to_string();

    if let StartExecResults::Attached { mut output, .. } = start_result {
        println!("Attached");
        while let Some(Ok(msg)) = output.next().await {
            match msg {
                LogOutput::StdOut { message } => std_out.push_str( String::from_utf8_lossy(&message ).as_ref() ),
                LogOutput::StdErr { message } => std_err.push_str( String::from_utf8_lossy(&message ).as_ref() ),
                LogOutput::Console { message } => println!("console: {:?}", String::from_utf8_lossy(&message)),
                _ => ()
            }
        }
    } else {
        unreachable!();
    }
    println!("exec done");

    let empty = "".to_string();
    Ok(DockerRunResult {
        std_out: match std_out.cmp(&empty) != Ordering::Equal {
            true => Some(std_out),
            false => None
        },
        std_err: match std_err.cmp(&empty) != Ordering::Equal {
            true => Some(std_err),
            false => None
        }
    })

}
