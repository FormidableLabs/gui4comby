#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]



mod maybe;
mod docker_run;
#[macro_use]
mod playground;
#[macro_use]
mod image;
#[macro_use]
mod filesystem;
mod main_ext;

use std::fs;
use std::path::MAIN_SEPARATOR;
use bollard::Docker;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{Manager, Runtime};
use resolve_path::PathResolveExt;
use tauri::regex::Regex;
use docker_run::DockerState;
use playground::{playground_match, playground_rewrite};
use image::{comby_image, download_comby_image, docker_version};
use filesystem::{dir_info, filesystem_content, filesystem_match, filesystem_rewrite, filesystem_rewrite_file};
use crate::main_ext::{ToolbarThickness, WindowExt, setup_window};


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    // type for source: stdout, stderr, debug?
    message: String,
    time: u128
} // TODO support user defined tag
fn server_log<R: Runtime>(app_handle: &tauri::AppHandle<R>, message: String) {
    println!("server log: {:?}", &message);
    let emit_result = app_handle.emit_all("server-log", Payload { message, time: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() });
    if emit_result.is_err() {
        println!("failed to send server log: {:?}", &emit_result.err());
    }
}


fn main() {
    let docker = Docker::connect_with_local_defaults();
    // let docker_result = docker.ok_or(format!("Docker Error: {}", docker.err.to_string()));
    tauri::Builder::default()
        .setup(|app| {
            let win = app.get_window("main").unwrap();
            // This is buggy when chrome toolbar is opened and window is resized
            setup_window(&win);
            Ok(())
        })
        .manage(DockerState { docker })
        .invoke_handler(tauri::generate_handler![
            greet,
            dir_info,
            docker_version,
            comby_image,
            download_comby_image,
            filesystem_content,
            filesystem_match,
            filesystem_rewrite,
            filesystem_rewrite_file,
            playground_match,
            playground_rewrite,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
