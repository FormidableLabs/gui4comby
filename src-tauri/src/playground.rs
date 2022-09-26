use tauri::Runtime;
use crate::{docker_run, DockerState, maybe, ThreadSafe};

#[derive(Clone, serde::Serialize)]
pub enum PlaygroundResultType {
    Match,
    Rewrite
}

#[derive(Clone, serde::Serialize)]
pub struct PlaygroundResult {
    pub result_type: PlaygroundResultType,
    pub result: Option<String>,
    pub warning: Option<String>
}

#[tauri::command]
pub async fn playground_match<R: Runtime>(
    state: tauri::State<'_, DockerState>,
    thread_safe: tauri::State<'_, ThreadSafe>,
    app_handle: tauri::AppHandle<R>,
    source: String,
    match_template: String,
    language: String,
    rule: String,
) -> Result<PlaygroundResult, String> {
    let docker = maybe::maybe_ref(&state.docker)?;
    let result = docker_run::docker_run(&thread_safe, docker, vec![
        "comby",
        match_template.as_str(),
        "",
        "-rule", rule.as_str(),
        "-matcher", language.as_str(),
        "-stdin",
        "-match-only",
        "-json-lines"
    ], Some(source), app_handle).await?;

    Ok(PlaygroundResult { result_type: PlaygroundResultType::Match, result: result.std_out, warning: result.std_err })
}

#[tauri::command]
pub async fn playground_rewrite<R: Runtime>(
    state: tauri::State<'_, DockerState>,
    thread_safe: tauri::State<'_, ThreadSafe>,
    app_handle: tauri::AppHandle<R>,
    source: String,
    match_template: String,
    rewrite_template: String,
    language: String,
    rule: String
) -> Result<PlaygroundResult, String> {
    let docker = maybe::maybe_ref(&state.docker)?;
    let result = docker_run::docker_run(&thread_safe, docker, vec![
        "comby",
        match_template.as_str(),
        rewrite_template.as_str(),
        "-rule", rule.as_str(),
        "-matcher", language.as_str(),
        "-stdin",
        "-json-lines"
    ], Some(source), app_handle).await?;

    Ok(PlaygroundResult { result_type: PlaygroundResultType::Rewrite, result: result.std_out, warning: result.std_err })
}
