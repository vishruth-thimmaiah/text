// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod editor;
mod lsp;
mod terminal;

use config::{
    local::{load_prev_state, save_state},
    themes::load_theme,
};
use editor::file::{add_chars, close_file, file_lines, list_dirs, open_file, remove_chars};
use lsp::*;
use serde::Serialize;
use std::sync::Mutex;
use terminal::Terminal;
use terminal::{init_terminal, read_from_term, resize_term, write_to_term};

use ropey::Rope;

#[derive(Serialize)]
struct OpenFiles {
    filepath: String,
    #[serde(skip_serializing)]
    rope: Mutex<Rope>,
}

#[derive(Serialize)]
struct InnerAppState {
    files: Mutex<Vec<OpenFiles>>,
    active_dir: Mutex<Option<String>>,
    #[serde(skip_serializing)]
    terminal: Terminal,
    #[serde(skip_serializing)]
    lsp: Mutex<Option<LspInfo>>,
}

impl Default for InnerAppState {
    fn default() -> Self {
        return {
            InnerAppState {
                files: Mutex::new(Vec::new()),
                active_dir: Mutex::new(None),
                terminal: Terminal::default(),
                lsp: Mutex::new(None),
            }
        };
    }
}

fn main() {
    let app_state = InnerAppState::default();

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            open_file,
            file_lines,
            add_chars,
            close_file,
            remove_chars,
            load_prev_state,
            load_theme,
            list_dirs,
            init_terminal,
            write_to_term,
            resize_term,
            read_from_term,
            start_lsp_server,
            initialize_lsp,
            initialized_lsp,
            hover_lsp,
            open_file_lsp,
            semantic_tokens_lsp,
        ])
        .build(tauri::generate_context!())
        .expect("error while running application")
        .run(|app_handle, event| match event {
            tauri::RunEvent::ExitRequested { .. } => save_state(app_handle),
            _ => {}
        });
}
