#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use bollard::container::{Config, CreateContainerOptions};
use bollard::Docker;
use bollard::errors::Error;
use bollard::exec::{CreateExecOptions, StartExecResults};
use bollard::image::CreateImageOptions;
use futures_util::{TryStreamExt, StreamExt, future};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{Manager};

struct DockerState {
    docker: Result<Docker, Error>,
}

struct MyState(String);

#[derive(Clone, serde::Serialize)]
struct Credentials {
    username: String,
    secret: String
}

#[derive(serde::Serialize)]
struct DockerAuth {
    credentials: Mutex<Option<Credentials>>
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
    time: u128
}


const IMAGE: &str = "comby/comby:latest"; // TODO support user defined tag

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn clear_docker_credentials(state: tauri::State<'_, DockerAuth>, username: String, secret: String) {
    *state.credentials.lock().unwrap() = None;
}

#[tauri::command]
fn get_docker_credentials(state: tauri::State<'_, DockerAuth>) -> DockerAuth {
    if state.credentials.lock().unwrap().is_none() {
        return DockerAuth { credentials: Mutex::new(None) };
    }
    return DockerAuth {
        credentials: Mutex::new(Some(Credentials {
            username: state.credentials.lock().unwrap().as_ref().unwrap().username.clone(),
            secret: "********".to_string()
        }))
    };
}

#[tauri::command]
fn set_docker_credentials(state: tauri::State<'_, DockerAuth>, username: String, secret: String) {
    *state.credentials.lock().unwrap() = Some(Credentials { username, secret });
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

#[tauri::command]
async fn playground_match(state: tauri::State<'_, DockerState>, auth: tauri::State<'_, DockerAuth>, app_handle: tauri::AppHandle) -> Result<String, String> {
    let docker = match &state.docker {
        Ok(docker) => docker,
        Err(error) => return Err(format!("Docker Error: {}", error.to_string())),
    };

    if auth.credentials.lock().unwrap().is_none() {
        return Err("You need to provide docker hub credentials to pull comby/comby".to_string());
    }

    match docker.create_image(
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
        }
        Err(error) => return Err(format!("Docker Image Error: {}", error.to_string()))
    }

    let container_config = Config {
        image: Some(IMAGE),
        tty: Some(true),
        ..Default::default()
    };

    let id = match docker
        .create_container::<&str, &str>(Some(CreateContainerOptions { name: "gui4comby-server" }), container_config)
        .await {
        Ok(container) => container.id,
        Err(error) => return Err(format!("Docker Container Error: {}", error.to_string()))
    };

    match docker.start_container::<String>(&id, None).await {
        Ok(_) => {}
        Err(error) => return Err(format!("Docker Container Error: {}", error.to_string()))
    }

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

//    let mut result_output: String = "".to_owned();
    if let StartExecResults::Attached { mut output, .. } = start_result {
        while let Some(Ok(msg)) = output.next().await {
            print!("{}", msg);
        }
    } else {
        unreachable!();
    }



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
        .manage(MyState("test".into()))
        .manage(DockerState { docker })
        .manage(DockerAuth { credentials: Mutex::new(None) })
        .invoke_handler(tauri::generate_handler![
            greet,
            docker_version,
            clear_docker_credentials,
            get_docker_credentials,
            set_docker_credentials,
            playground_match
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
