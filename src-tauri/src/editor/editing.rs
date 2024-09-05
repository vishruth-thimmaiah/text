use std::fs::File;

use tauri::State;

use crate::AppState;

#[tauri::command]
pub fn update_line(
    file_index: usize,
    chars: String,
    start_line: usize,
    start_char: usize,
    state: State<'_, AppState>,
) {
    let files = &state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();
    let mut rope = file.rope.lock().unwrap();
    let line_index = rope.line_to_char(start_line);

    rope.insert(line_index + start_char, &chars);
}

#[tauri::command]
pub fn delete_char(
    file_index: usize,
    start_line: usize,
    start_char: usize,
    count: usize,
    state: State<'_, AppState>,
) {
    let files = &state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();
    let mut rope = file.rope.lock().unwrap();
    let line_index = rope.line_to_char(start_line);

    rope.remove(line_index + start_char - count..line_index + start_char);
}

#[tauri::command]
pub fn update_file(file_index: usize, state: State<'_, AppState>) {
    let files = &state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();
    let rope = file.rope.lock().unwrap();

    rope.write_to(File::create(&file.filepath).unwrap())
        .unwrap();
}
