// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::File, sync::Mutex, usize};

use ropey::Rope;
use tauri::State;

struct AppState {
    files: Mutex<Vec<Rope>>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn open_file(filepath: String, state: State<AppState>) {
    let text = ropey::Rope::from_reader(File::open(filepath).unwrap()).unwrap();

    state.files.lock().unwrap().push(text);
}

#[tauri::command]
fn file_lines(
    file_index: usize,
    mut start_pos: usize,
    end_pos: usize,
    state: State<AppState>,
) -> Vec<String> {
    let files = state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();

    let mut lines: Vec<String> = vec![];
    let mut line = file.lines_at(start_pos);
    while start_pos < end_pos {
        let next_line = line.next();
        if next_line == None {
            break
        }
        lines.push(next_line.expect("Error reading file").to_string());
        start_pos += 1;
    }

    lines
}

fn main() {
    let app_state = AppState {
        files: Mutex::new(vec![]),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![open_file, file_lines])
        .run(tauri::generate_context!())
        .expect("error while running application");
}
