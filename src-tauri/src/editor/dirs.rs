use std::path::PathBuf;

use serde::Serialize;
use tauri::State;

use crate::InnerAppState;

#[derive(Debug, Serialize)]
struct Files {
    name: String,
}

#[derive(Debug, Serialize)]
pub struct Dirs {
    name: String,
    files: Vec<Files>,
    subdirs: Vec<Dirs>,
}

impl Dirs {
    fn from(name: String) -> Self {
        Self {
            name,
            files: Vec::new(),
            subdirs: Vec::new(),
        }
    }
}

fn add_contents(path: PathBuf, cwd: &mut Dirs) {
    let contents = path.read_dir().unwrap();

    for item in contents {
        if let Ok(item) = item {
            let filetype = item.file_type().unwrap();
            let filename = item.file_name().into_string().unwrap();
            if filetype.is_dir() {
                let nested_dir = path.join(filename);
                cwd.subdirs
                    .push(Dirs::from(nested_dir.to_str().unwrap().to_string()));
                add_contents(nested_dir, cwd.subdirs.last_mut().unwrap());
            } else if filetype.is_file() {
                cwd.files.push(Files { name: filename })
            }
        }
    }
}

#[tauri::command]
pub fn list_dirs(cwd: String, state: State<'_, InnerAppState>) -> Dirs {
    let root_dir = PathBuf::from(&cwd);
    *state.active_dir.lock().unwrap() = Some(cwd.clone());

    let mut dirs = Dirs::from(cwd);

    add_contents(root_dir, &mut dirs);

    dirs
}
