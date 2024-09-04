use std::fs;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Settings {}

#[tauri::command]
pub fn load_settings(app_handle: tauri::AppHandle) -> Option<Settings> {
    let settings_dir = app_handle
        .path_resolver()
        .app_config_dir()
        .unwrap()
        .join("settings.toml");

    let file = fs::read_to_string(settings_dir);
    if let Ok(settings) = file {
        let toml = toml::from_str::<Settings>(&settings);
        return toml.ok();
    }
    return None;
}
