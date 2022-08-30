#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::future::Future;
use std::sync::Mutex;
use bollard::container::{Config, CreateContainerOptions, ListContainersOptions};
use bollard::Docker;
use bollard::errors::Error;
use bollard::exec::{CreateExecOptions, StartExecResults};
use bollard::image::{CreateImageOptions, ListImagesOptions, SearchImagesOptions};
use futures_util::{TryStreamExt, StreamExt, future};
use std::time::{SystemTime, UNIX_EPOCH};
use bollard::models::{ContainerSummary, ImageSearchResponseItem, ImageSummary};
use tauri::{Manager};

struct DockerState {
    docker: Result<Docker, Error>,
}


#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
    time: u128
}

#[derive(Clone, serde::Deserialize)]
struct Credentials {
    username: String,
    secret: String
}


const IMAGE: &str = "comby/comby:latest"; // TODO support user defined tag

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn docker_version(state: tauri::State<'_, DockerState>) -> Result<String,String> {
//    thread::sleep(time::Duration::from_millis(0));
    let docker = match &state.docker {
        Ok(docker) => docker,
        Err(error) => return Err(format!("Docker Error: {}", error.to_string())),
    };

    println!("getting docker version");
    let version = match docker.version().await {
        Ok(version) => version,
        Err(error) => return Err(format!("Docker Command Error: {}", error.to_string()))
    };

    println!("{}", format!("returning result {:?}", version));
    let engine_info = match version.components {
        Some(x) => x.into_iter().find(|comp| comp.name == "Engine"),
        None    => return Err("Could not version components".to_string()),
    };
    match engine_info {
        None => Err("Did not find engine component info".to_string()),
        Some(info) => Ok(format!("{:?}", info.version))
    }
}

async fn get_latest_downloaded_comby_image(docker: &Docker) -> Result<String, String> {
    let images = match docker.list_images(Some(ListImagesOptions::<String> {
        all: true,
        ..Default::default()
    })).await {
        Ok(result) => result,
        Err(error) => return futures_util::__private::Err(format!("Image List Error: {}", error.to_string()))
    };

    let mut filtered = images.iter().filter(|image|
        image.repo_tags.get(0).unwrap().contains("comby/comby")).collect::<Vec<_>>();

    filtered.sort_by(|a,b| b.created.cmp(&a.created));

    if filtered.len() > 0 {
        return Ok(format!("{}", filtered.get(0).unwrap().repo_tags.get(0).unwrap()));
    }
    return Err("Image Error: Unable to find an image of 'comby/comby' locally".to_string());
}

#[tauri::command]
async fn comby_image(state: tauri::State<'_, DockerState>) -> Result<String, String> {
    let docker = match &state.docker {
        Ok(docker) => docker,
        Err(error) => return Err(format!("Docker Error: {}", error.to_string())),
    };
    let image = get_latest_downloaded_comby_image(docker).await;
    return image;
}

#[tauri::command]
async fn download_comby_image(state: tauri::State<'_, DockerState>, credentials: Option<Credentials>, app_handle: tauri::AppHandle) -> Result<String, String> {
    let docker = match &state.docker {
        Ok(docker) => docker,
        Err(error) => return Err(format!("Docker Error: {}", error.to_string())),
    };

    let result = match docker.create_image(
        Some(CreateImageOptions {
            from_image: IMAGE,
            ..Default::default()
        }),
        None,
        None,
    ).and_then(move |result| {
        format!("create info: {:?}", &result);
        // TODO use bespoke message
        let emit_result = app_handle.emit_all("server-log", Payload { message: format!("{:?}", &result).into(), time: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() });
        if emit_result.is_err() {
            println!("event error {:?}", &emit_result.err());
        }
        return future::ok(Some(result));
    })
        .try_collect::<Vec<_>>().await {
            Ok(i) => {
                println!("final create image info {:?}", i);
            },
            Err(error) => return Err(format!("Docker Image Error: {}", error.to_string()))
    };

    return Ok("Downloaded newer image for comby/comby:latest".to_string());
}

#[tauri::command]
async fn playground_match(state: tauri::State<'_, DockerState>, app_handle: tauri::AppHandle) -> Result<String, String> {
    let docker = match &state.docker {
        Ok(docker) => docker,
        Err(error) => return Err(format!("Docker Error: {}", error.to_string())),
    };

    let image = get_latest_downloaded_comby_image(docker).await?;

    let container_config = Config {
        image: Some(image.as_str()),
        tty: Some(true),
        ..Default::default()
    };
    println!("checking for existing container");
    let existingContainer = match docker.list_containers(Some(ListContainersOptions::<String> {
        all: true,
        filters: HashMap::from([
            ("name".to_string(), vec!["/gui4comby-server".to_string()])
        ]),
        ..Default::default()
    })).await {
        Ok(result) => result,
        Err(err) => return Err(format!("List Containers Error: {}", err.to_string()))
    };

    let id = match existingContainer.len() {
        0 => {
            println!("creating a container for use");
            match docker
                .create_container::<&str, &str>(Some(CreateContainerOptions { name: "gui4comby-server" }), container_config)
                .await {
                Ok(container) => container.id,
                Err(error) => return Err(format!("Docker Container Error: {}", error.to_string()))
            }
        },
        _ => {
            println!("found an existing container for use");
            existingContainer.get(0).unwrap().id.as_ref().unwrap().to_string()
        }
    };
    // let id = match docker
    //     .create_container::<&str, &str>(Some(CreateContainerOptions { name: "gui4comby-server" }), container_config)
    //     .await {
    //     Ok(container) => container.id,
    //     Err(error) => return Err(format!("Docker Container Error: {}", error.to_string()))
    // };

    println!("starting container");
    match docker.start_container::<String>(&id, None).await {
        Ok(_) => {}
        Err(error) => return Err(format!("Docker Container Error: {}", error.to_string()))
    }

    println!("execing container");
    let exec = match docker
        .create_exec(
            &id,
            CreateExecOptions {
                attach_stdout: Some(true),
                attach_stderr: Some(true),
                cmd: Some(vec!["comby", "-h"]),
                ..Default::default()
            },
        )
        .await {
        Ok(results) => results.id,
        Err(error) => return Err(format!("Docker Exec Error: {}", error.to_string()))
    };

    let start_result = match docker.start_exec(&exec, None).await {
        Ok(result) => result,
        Err(error) => return Err(format!("Docker Exec Start Error: {}", error.to_string()))
    };

    println!("start_exec_result: {:?}", &start_result);
    match start_result {
        StartExecResults::Attached { mut output, .. } => {
            output.and_then(|s| {
                println!("exec: {:?}", s);
                return future::ok(Some(s))
            }).try_collect::<Vec<_>>().await;
        }
        StartExecResults::Detached => {}
    }
//    let mut result_output: String = "".to_owned();
//     if let StartExecResults::Attached { mut output, .. } = start_result {
//         println!("Attached");
//         let r = output.next().await;
//
//         // while let Some(Ok(msg)) = output.next().await {
//         //     let emit_result = app_handle.emit_all("server-log", Payload { message: format!("{:?}", &msg).into(), time: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() });
//         //     if emit_result.is_err() {
//         //         println!("event error {:?}", &emit_result.err());
//         //     }
//         //     println!("msg: {:?}", &msg);
//         // }
//     } else {
//         println!("... 'unreachable' :(");
//         unreachable!();
//     }
    println!("exec done");


    Ok("success".to_string())
}

#[tauri::command]
async fn playground_rewrite() -> Result<String, String> {
    Ok("success".to_string())
}

fn main() {
    let docker = Docker::connect_with_local_defaults();
    // let docker_result = docker.ok_or(format!("Docker Error: {}", docker.err.to_string()));
    tauri::Builder::default()
        .manage(DockerState { docker })
        .invoke_handler(tauri::generate_handler![
            greet,
            docker_version,
            comby_image,
            download_comby_image,
            playground_match
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
