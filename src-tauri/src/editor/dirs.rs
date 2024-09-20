use std::{path::PathBuf, process::Command};

use serde::Serialize;
use tauri::State;

use crate::AppState;

#[derive(Debug, Serialize)]
struct Files {
    name: String,
    ignored: bool,
}

#[derive(Debug, Serialize)]
pub struct Dirs {
    name: String,
    files: Vec<Files>,
    subdirs: Vec<Dirs>,
    ignored: bool,
}

impl Dirs {
    fn from(name: &str, ignored: bool) -> Self {
        Self {
            name: name.to_string(),
            files: Vec::new(),
            subdirs: Vec::new(),
            ignored,
        }
    }
}

fn check_ignored(cwd: &str, file: PathBuf) -> bool {
    let filename = file.file_name().unwrap().to_str().unwrap();
    if filename.starts_with(".") {
        return true;
    }
    if let Ok(ignored) = Command::new("git")
        .current_dir(cwd)
        .args(["check-ignore", file.to_str().unwrap()])
        .output()
    {
        if ignored.stdout.len() > 0 {
            return true;
        }
    }
    false
}

fn add_contents(start_dir: PathBuf, result_dir: &mut Dirs, cwd: &str, ignored: bool) {
    let contents = start_dir.read_dir().unwrap();

    for item in contents {
        if let Ok(item) = item {
            let filetype = item.file_type().unwrap();
            let filename = item.file_name().into_string().unwrap();
            if filetype.is_dir() {
                let nested_dir = start_dir.join(filename);
                let ignored = ignored || check_ignored(cwd, nested_dir.clone());
                result_dir.subdirs.push(Dirs::from(
                    nested_dir.to_str().unwrap(),
                    ignored,
                ));
                add_contents(nested_dir, result_dir.subdirs.last_mut().unwrap(), cwd, ignored);
            } else if filetype.is_file() {
                result_dir.files.push(Files {
                    ignored: ignored || check_ignored(cwd, start_dir.join(&filename)),
                    name: filename,
                })
            }
        }
    }
}

#[tauri::command]
pub fn list_dirs(cwd: &str, state: State<'_, AppState>) -> Dirs {
    let root_dir = PathBuf::from(&cwd);
    *state.active_dir.lock().unwrap() = Some(cwd.to_string());

    let mut result_dirs = Dirs::from(cwd, false);

    add_contents(root_dir, &mut result_dirs, cwd, false);

    result_dirs
}
