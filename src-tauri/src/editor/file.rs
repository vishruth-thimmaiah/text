use std::fs;
use std::{fs::File, usize};
use std::sync::Mutex;

use tauri::State;

use crate::{AppState, OpenFiles};

#[tauri::command]
pub fn open_file(filepath: String, state: State<'_, AppState>) -> usize {
    let rope = ropey::Rope::from_reader(File::open(&filepath).unwrap()).unwrap();

    let length = rope.len_lines();
    state.files.lock().unwrap().push(OpenFiles {
        filepath,
        rope: Mutex::new(rope),
    });
    length
}

#[tauri::command]
pub fn new_file(path: String, filename: String) {
    let fullpath = path + "/" + filename.as_str();
    if filename.ends_with("/") {
        fs::create_dir_all(fullpath).unwrap();
    }
    else {
        let req_dirs = &fullpath[..fullpath.rfind("/").unwrap()];
        fs::create_dir_all(req_dirs).unwrap();
        File::create(fullpath).unwrap();
    }
}

#[tauri::command]
pub fn close_file(file_index: usize, state: State<'_, AppState>) {
    let mut files = state.files.lock().unwrap();
    files.remove(file_index);
}

#[tauri::command]
pub fn file_lines(
    file_index: usize,
    mut start_pos: usize,
    end_pos: usize,
    state: State<'_, AppState>,
) -> Vec<String> {
    let files = state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();

    let mut lines: Vec<String> = vec![];
    let binding = file.rope.lock().unwrap();
    if let Some(mut line) = binding.get_lines_at(start_pos) {
        while start_pos < end_pos {
            let next_line = line.next();
            if next_line == None {
                break;
            }

            let new_line = next_line.expect("Error reading file").to_string();
            lines.push(new_line);
            start_pos += 1;
        }
    }

    lines
}
