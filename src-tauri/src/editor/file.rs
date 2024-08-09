use std::fs::File;
use std::{fs, sync::Mutex};

use tauri::State;

use crate::{InnerAppState, OpenFiles};

#[tauri::command]
pub fn list_files(
    dir: String,
    state: State<'_, Mutex<InnerAppState>>,
) -> (Vec<String>, Vec<String>) {
    let files = fs::read_dir(&dir).unwrap();
    state.lock().unwrap().active_dir = Some(dir);

    let mut file_names = Vec::new();
    let mut dir_names = Vec::new();

    for file in files {
        if let Ok(file) = file {
            let path = file.path();
            let pathname = path
                .file_name()
                .unwrap()
                .to_str()
                .map(|s| s.to_owned())
                .unwrap();
            if path.is_file() {
                file_names.push(pathname)
            } else if path.is_dir() {
                dir_names.push(pathname)
            }
        }
    }

    return (file_names, dir_names);
}

#[tauri::command]
pub fn open_file(filepath: String, state: State<'_, Mutex<InnerAppState>>) {
    let rope = ropey::Rope::from_reader(File::open(&filepath).unwrap()).unwrap();
    state.lock().unwrap().files.push(OpenFiles {
        filepath,
        rope: Mutex::new(rope),
    });
}

#[tauri::command]
pub fn close_file(file_index: usize, state: State<'_, Mutex<InnerAppState>>) {
    let mut files = state.lock().unwrap();
    files.files.remove(file_index);
}

#[tauri::command]
pub fn file_lines(
    file_index: usize,
    mut start_pos: usize,
    end_pos: usize,
    state: State<'_, Mutex<InnerAppState>>,
) -> Vec<String> {
    let files = state.lock().unwrap();
    let file = files.files.get(file_index).unwrap();

    let mut lines: Vec<String> = vec![];
    let binding = file.rope.lock().unwrap();
    if let Some(mut line) = binding.get_lines_at(start_pos) {
        while start_pos < end_pos {
            let next_line = line.next();
            if next_line == None {
                break;
            }
            lines.push(next_line.expect("Error reading file").to_string());
            start_pos += 1;
        }
    }

    lines
}

#[tauri::command]
pub fn add_chars(
    file_index: usize,
    chars: String,
    start_line: usize,
    start_point: usize,
    state: State<'_, Mutex<InnerAppState>>,
) {
    let files = &state.lock().unwrap();
    let file = files.files.get(file_index).unwrap();
    let mut rope = file.rope.lock().unwrap();
    let line_index = rope.line_to_char(start_line);
    let line_end_index = rope.line_to_char(start_line + 1);

    let mut new_line = rope.line(start_line).to_string();

    new_line.insert_str(start_point, &chars);

    rope.remove(line_index..line_end_index);
    rope.insert(line_index, &new_line);

    rope.write_to(File::create(&file.filepath).unwrap())
        .unwrap();
}

#[tauri::command]
pub fn remove_chars(
    file_index: usize,
    count: usize,
    start_line: usize,
    start_point: usize,
    state: State<'_, Mutex<InnerAppState>>,
) {
    let files = &state.lock().unwrap();
    let file = files.files.get(file_index).unwrap();
    let mut rope = file.rope.lock().unwrap();
    let line_index = rope.line_to_char(start_line);
    let line_end_index = rope.line_to_char(start_line + 1);

    let new_line = rope.line(start_line).to_string();

    let new_line = if start_point < count {
        new_line[start_point..].to_string()
    } else {
        new_line[0..start_point - count].to_string() + &new_line[start_point..]
    };

    rope.remove(line_index..line_end_index);
    rope.insert(line_index, &new_line);

    rope.write_to(File::create(&file.filepath).unwrap())
        .unwrap();
}
