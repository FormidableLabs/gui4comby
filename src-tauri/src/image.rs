use bollard::image::{CreateImageOptions, ListImagesOptions};
use std::time::{SystemTime, UNIX_EPOCH};
use futures_util::{future, TryStreamExt};
use bollard::Docker;
use tauri::Manager;
use crate::{DockerState, Payload};

pub async fn get_latest_downloaded_comby_image(docker: &Docker) -> Result<String, String> {
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
pub async fn comby_image(state: tauri::State<'_, DockerState>) -> Result<String, String> {
    let docker = match &state.docker {
        Ok(docker) => docker,
        Err(error) => return Err(format!("Docker Error: {}", error.to_string())),
    };
    let image = get_latest_downloaded_comby_image(docker).await;
    return image;
}

#[tauri::command]
pub async fn download_comby_image(state: tauri::State<'_, DockerState>, credentials: Option<Credentials>, app_handle: tauri::AppHandle) -> Result<String, String> {
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

#[derive(Clone, serde::Deserialize)]
pub struct Credentials {
    pub username: String,
    pub secret: String
}


const IMAGE: &str = "comby/comby:latest";

#[tauri::command]
pub async fn docker_version(state: tauri::State<'_, DockerState>) -> Result<String,String> {
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
