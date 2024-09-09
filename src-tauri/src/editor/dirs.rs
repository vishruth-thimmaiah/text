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
            ignored
        }
    }
}

fn check_git_ignored(cwd: &str, file: PathBuf) -> bool {
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

fn add_contents(path: PathBuf, dir: &mut Dirs, cwd: &str) {
    let contents = path.read_dir().unwrap();

    for item in contents {
        if let Ok(item) = item {
            let filetype = item.file_type().unwrap();
            let filename = item.file_name().into_string().unwrap();
            if filetype.is_dir() {
                let nested_dir = path.join(filename);
                dir.subdirs.push(Dirs::from(nested_dir.to_str().unwrap(), check_git_ignored(cwd, nested_dir.clone())));
                add_contents(nested_dir, dir.subdirs.last_mut().unwrap(), cwd);
            } else if filetype.is_file() {
                dir.files.push(Files {
                    ignored: check_git_ignored(cwd, path.join(&filename)),
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

    let mut dirs = Dirs::from(cwd, false);

    add_contents(root_dir, &mut dirs, cwd);

    dirs
}
