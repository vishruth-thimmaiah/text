use std::fs;

use serde::{Deserialize, Serialize};
use toml::Table;

// #[derive(Debug, Deserialize, Serialize)]
// pub struct Theme {
//     background_color: String,
// }

#[tauri::command]
pub fn load_theme(app_handle: tauri::AppHandle) -> Option<Table> {
    let theme_dir = app_handle
        .path_resolver()
        .app_config_dir()
        .unwrap()
        .join("theme.toml");

    let file = fs::read_to_string(theme_dir);
    if let Ok(theme) = file {
        let toml = toml::from_str::<Table>(&theme);
        return toml.ok();
    }
    return None;
}
