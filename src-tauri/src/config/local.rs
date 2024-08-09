use std::{fs, sync::Mutex};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::InnerAppState;

#[derive(Debug, Deserialize, Serialize)]
pub struct History {
    files: Vec<String>,
    active_dir: String,
}

#[tauri::command]
pub fn load_prev_state(app_handle: tauri::AppHandle) -> Option<History> {
    let dir = app_handle
        .path_resolver()
        .app_data_dir()
        .unwrap()
        .join("history.toml");
    let file = fs::read_to_string(dir).unwrap_or_else(|_| String::new());

    let toml = toml::from_str::<History>(file.as_str()).ok();

    toml
}

pub fn save_state(app_handle: &AppHandle) {
    let dir = app_handle
        .path_resolver()
        .app_data_dir()
        .unwrap()
        .join("history.toml");

    let mut history = History {
        files: vec![],
        active_dir: "".to_string(),
    };

    let state = app_handle.state::<Mutex<InnerAppState>>();
    let c = state.lock().unwrap();
    history.active_dir = c.active_dir.clone().unwrap_or_default();
    for file in &c.files {
        history.files.push(file.filepath.clone());
    }

    let toml = toml::to_string(&history);
    let _ = fs::write(dir, toml.unwrap());
}
