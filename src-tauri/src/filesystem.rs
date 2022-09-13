use std::fs;
use std::path::MAIN_SEPARATOR;
use resolve_path::PathResolveExt;
use crate::{maybe, Regex};

#[derive(Clone, serde::Serialize)]
pub struct DirInfoResult {
    pub resolved_path: String,
    pub exists: bool,
    pub children: Option<Vec<String>>,
    pub candidates: Option<Vec<String>>,
    pub home_dir: Option<String>,
    pub in_home_dir: Option<bool>,
    pub path_separator: String,
}

#[tauri::command]
pub fn dir_info(path: String) -> Result<DirInfoResult, String> {
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

    let resolved_path = maybe::maybe(search_path.try_resolve())?;
    let children: Option<Vec<String>> = match resolved_path.exists() {
        true => Some(maybe::maybe(fs::read_dir(resolved_path.as_ref()))?.into_iter()
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
            Some(parent) => Some(maybe::maybe(fs::read_dir(parent))?.into_iter()
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
