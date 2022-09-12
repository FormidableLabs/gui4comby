#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::cmp::Ordering;
use std::collections::HashMap;
use std::fs;
use std::path::{MAIN_SEPARATOR, Path};
use bollard::container::{Config, CreateContainerOptions, ListContainersOptions, LogOutput};
use bollard::Docker;
use bollard::errors::Error;
use bollard::exec::{CreateExecOptions, StartExecResults};
use bollard::image::{CreateImageOptions, ListImagesOptions};
use futures_util::{TryStreamExt, StreamExt, future};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{Manager};
use tokio::io::AsyncWriteExt;

struct DockerState {
    docker: Result<Docker, Error>,
}


#[derive(Clone, serde::Serialize)]
struct Payload {
    // type for source: stdout, stderr, debug?
    message: String,
    time: u128
}

#[derive(Clone, serde::Deserialize)]
struct Credentials {
    username: String,
    secret: String
}

#[derive(Clone, serde::Serialize)]
enum PlaygroundResultType {
    Match,
    Rewrite
}

#[derive(Clone, serde::Serialize)]
struct PlaygroundResult {
    result_type: PlaygroundResultType,
    result: Option<String>,
    warning: Option<String>
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
    // TODO: use credentials to download image
    let _result = match docker.create_image(
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

struct DockerRunResult {
    std_out: Option<String>,
    std_err: Option<String>,
}

fn server_log(app_handle: &tauri::AppHandle, message: String) {
    println!("server log: {:?}", &message);
    let emit_result = app_handle.emit_all("server-log", Payload { message, time: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() });
    if emit_result.is_err() {
        println!("failed to send server log: {:?}", &emit_result.err());
    }
}

async fn docker_run(docker: &Docker, cmd: Vec<&str>, std_in: Option<String>, app_handle: tauri::AppHandle) -> Result<DockerRunResult, String> {
    let image = get_latest_downloaded_comby_image(docker).await?;

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
    let existing_container = maybe(docker.list_containers(Some(ListContainersOptions::<String> {
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
            server_log(&app_handle, format!("Creating container {} to run commands with", container_name));
            maybe(docker
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
        server_log(&app_handle, "Starting container".to_string())
    }
    println!("starting container");
    maybe(docker.start_container::<String>(&id, None).await)?;


    println!("execing container");
    server_log(&app_handle, format!("Docker Run\n$ {}", cmd.join(" ")));
    let exec = maybe(docker
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

    let start_result = maybe(docker.start_exec(&exec, None).await)?;

    println!("start_exec_result: {:?}", &start_result);
    let mut std_out: String = "".to_string();
    let mut std_err: String = "".to_string();

    if let StartExecResults::Attached { mut output, mut input } = start_result {
        println!("Attached");
        if std_in.is_some() {
            println!("Writing stdin");
            maybe(input.write_all(format!("{}", std_in.unwrap()).as_bytes()).await)?;
            maybe(input.flush().await)?;
            maybe(input.shutdown().await)?;
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

#[tauri::command]
async fn playground_match(state: tauri::State<'_, DockerState>, app_handle: tauri::AppHandle, source: String, match_template: String, language: String) -> Result<PlaygroundResult, String> {
    let docker = maybe_ref(&state.docker)?;
    let result = docker_run(docker, vec![
        "comby", match_template.as_str(), "", "-matcher", language.as_str(), "-stdin", "-match-only", "-json-lines"
    ], Some(source), app_handle).await?;

    Ok(PlaygroundResult { result_type: PlaygroundResultType::Match, result: result.std_out, warning: result.std_err })
}

#[tauri::command]
async fn playground_rewrite(state: tauri::State<'_, DockerState>, app_handle: tauri::AppHandle, source: String, match_template: String, rewrite_template: String, language: String) -> Result<PlaygroundResult, String> {
    let docker = maybe_ref(&state.docker)?;
    let result = docker_run(docker, vec![
        "comby", match_template.as_str(), rewrite_template.as_str(), "-matcher", language.as_str(), "-stdin", "-json-lines"
    ], Some(source), app_handle).await?;

    Ok(PlaygroundResult { result_type: PlaygroundResultType::Rewrite, result: result.std_out, warning: result.std_err })
}

fn maybe<S,F>(result: Result<S, F>) -> Result<S, String> where F: std::fmt::Display {
    return match result {
        Ok(success) => Ok(success),
        Err(err) => Err(format!("{:?}", err.to_string()))
    }
}
fn maybe_ref<S,F>(result: &Result<S, F>) -> Result<&S, String> where F: std::fmt::Display {
    return match result {
        Ok(success) => Ok(success),
        Err(err) => Err(format!("{:?}", err.to_string()))
    }
}

#[derive(Clone, serde::Serialize)]
struct DirInfoResult {
    resolved_path: String,
    exists: bool,
    children: Option<Vec<String>>,
    candidates: Option<Vec<String>>,
    home_dir: Option<String>,
    in_home_dir: Option<bool>,
    path_separator: String,
}

use resolve_path::PathResolveExt;
use tauri::regex::Regex;

#[tauri::command]
fn dir_info(path: String) -> Result<DirInfoResult, String> {
    let home_result = "~/".try_resolve();
    let home_dir = match home_result {
        Ok(_) => Some(format!("{}", home_result.as_ref().unwrap().to_string_lossy())),
        Err(_) => None,
    };

    let search_path: String = match home_dir {
        None => match path.starts_with("~") {
            true => { return Err(format!("Could not resolve home path: {:?}", &home_result.err())); },
            false => path
        }
        Some(_) => {
            let re = Regex::new(r"^~/?").unwrap();
            let result = re.replace_all(path.as_str(), home_dir.as_ref().unwrap().as_str());
            result.to_string()
        }
    };

    let resolved_path = maybe(search_path.try_resolve())?;
    let children: Option<Vec<String>> = match resolved_path.exists() {
        true => Some(maybe(fs::read_dir(resolved_path.as_ref()))?.into_iter()
                .filter(|r| r.is_ok())
                .map(|r| r.unwrap().path()) // This is safe, since we only have the Ok variants
                .filter(|r| r.is_dir()) // Filter out non-folders
                .map(|r| format!("{}",r.to_string_lossy()))
                .collect()),
        false => None
    };

    let candidates: Option<Vec<String>> = match resolved_path.exists() {
        true => None,
        false => match resolved_path.parent() {
            None => None,
            Some(parent) => Some(maybe(fs::read_dir(parent))?.into_iter()
                .filter(|r| r.is_ok()) // Get rid of Err variants for Result<DirEntry>
                .map(|r| r.unwrap().path()) // This is safe, since we only have the Ok variants
                .filter(|r| r.is_dir()) // Filter out non-folders
                .filter(|r| {
                    // Given ~/path/to/foba
                    // Matches:
                    //   ~/path/to/foba
                    //   ~/path/to/fooBar
                    //   ~/path/to/fooBuzAdmin
                    let parent = match r.parent() {
                        None => "".to_string(),
                        Some(_) => format!("{}{}", r.parent().unwrap().to_string_lossy(), MAIN_SEPARATOR)
                    };
                    let candidate = r.to_string_lossy();
                    let search = resolved_path.as_ref().to_string_lossy().replace(&parent, "");
                    //let pattern: String = resolved_path.as_ref().to_string_lossy().replace(&parent, "").chars().enumerate().into_iter().map(|c| format!(".*{}", c.1)).collect();
                    let pattern: String = search
                        .chars().enumerate().into_iter()
                        .map(|e| format!("{}", e.1))
                        .collect::<Vec<String>>()
                        .join(".*");
                    if pattern.len() < 1 {  return true; }
                    let re_pattern = format!("{}", pattern);
                    let candidate_child = candidate.replace(&parent, "");

                    // if we only want to match items that start w/ what is left in remainder
                    //return candidate_child.starts_with(&search);

                    let re = Regex::new(&re_pattern);
                    if re.is_err() { return true; }
                    return re.unwrap().is_match(&candidate_child);
                }) // filter out regex matches
                .map(|r| format!("{}", r.to_string_lossy()))
                .collect())
        }
    };

    Ok(DirInfoResult {
        resolved_path: format!("{}", &resolved_path.to_string_lossy()),
        exists: resolved_path.exists(),
        children,
        candidates,
        home_dir: match &home_dir {
            None => None,
            Some(d) => Some(format!("{}", d))
        },
        in_home_dir: match resolved_path.exists() {
            true => match &home_dir {
                None => Some(false),
                Some(_) => Some(resolved_path.starts_with(home_dir.unwrap()))
            },
            false => None
        },
        path_separator: format!("{}", MAIN_SEPARATOR)
    })
}

fn main() {
    let docker = Docker::connect_with_local_defaults();
    // let docker_result = docker.ok_or(format!("Docker Error: {}", docker.err.to_string()));
    tauri::Builder::default()
        .manage(DockerState { docker })
        .invoke_handler(tauri::generate_handler![
            greet,
            dir_info,
            docker_version,
            comby_image,
            download_comby_image,
            playground_match,
            playground_rewrite
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
