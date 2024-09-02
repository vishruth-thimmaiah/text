use std::fs;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::AppState;

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

    let state = app_handle.state::<AppState>();
    history.active_dir = state.active_dir.lock().unwrap().clone().unwrap_or_default();
    for file in &*state.files.lock().unwrap() {
        history.files.push(file.filepath.clone());
    }

    let toml = toml::to_string(&history);
    let _ = fs::write(dir, toml.unwrap());
}
