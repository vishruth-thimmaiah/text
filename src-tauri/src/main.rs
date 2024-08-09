// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod editor;

use config::local::{load_prev_state, save_state};
use editor::file::{add_chars, close_file, file_lines, list_files, open_file, remove_chars};
use serde::Serialize;
use std::sync::Mutex;

use ropey::Rope;

#[derive(Serialize)]
struct OpenFiles {
    filepath: String,
    #[serde(skip_serializing)]
    rope: Mutex<Rope>,
}

#[derive(Serialize)]
struct InnerAppState {
    files: Vec<OpenFiles>,
    active_dir: Option<String>,
}

impl Default for InnerAppState {
    fn default() -> Self {
        return {
            InnerAppState {
                files: Vec::new(),
                active_dir: None,
            }
        };
    }
}

fn main() {
    let app_state = Mutex::new(InnerAppState::default());

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            open_file,
            file_lines,
            add_chars,
            list_files,
            close_file,
            remove_chars,
            load_prev_state
        ])
        .build(tauri::generate_context!())
        .expect("error while running application")
        .run(|app_handle, event| match event {
            tauri::RunEvent::ExitRequested { .. } => save_state(app_handle),
            _ => {}
        });
}
