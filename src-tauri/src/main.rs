// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::File, sync::Mutex};

use ropey::Rope;
use tauri::State;

struct OpenFiles {
    filepath: String,
    rope: Mutex<Rope>,
}

struct AppState {
    files: Mutex<Vec<OpenFiles>>,
}

#[tauri::command]
fn open_file(filepath: String, state: State<AppState>) {
    let rope = ropey::Rope::from_reader(File::open(&filepath).unwrap()).unwrap();

    state.files.lock().unwrap().push(OpenFiles {
        filepath,
        rope: Mutex::new(rope),
    });
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
    let binding = file.rope.lock().unwrap();
    let mut line = binding.lines_at(start_pos);
    while start_pos < end_pos {
        let next_line = line.next();
        if next_line == None {
            break;
        }
        lines.push(next_line.expect("Error reading file").to_string());
        start_pos += 1;
    }

    lines
}

#[tauri::command]
fn add_chars(file_index: usize, chars: String, start_line: usize, start_point: usize, state: State<AppState>) {
    let files = state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();
    let line_index = file.rope.lock().unwrap().line_to_char(start_line);
    let line_end_index = file.rope.lock().unwrap().line_to_char(start_line + 1);

    let mut new_line = file.rope.lock().unwrap().line(start_line).to_string();

    new_line.insert_str(start_point, &chars);

    file.rope.lock().unwrap().remove(line_index..line_end_index);
    file.rope.lock().unwrap().insert(line_index, &new_line);

    file.rope
        .lock()
        .unwrap()
        .write_to(File::create(&files[file_index].filepath).unwrap())
        .unwrap();
}

fn main() {
    let app_state = AppState {
        files: Mutex::new(vec![]),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![open_file, file_lines, add_chars])
        .run(tauri::generate_context!())
        .expect("error while running application");
}
