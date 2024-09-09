use std::fs::File;

use tauri::State;

use crate::{change_file_lsp, partial_semantic_tokens_lsp, AppState};

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

    change_file_lsp(
        &file.filepath,
        start_line,
        start_char,
        start_line,
        start_char,
        &chars,
        &state,
    );
    partial_semantic_tokens_lsp(&file.filepath, &state);
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

    let end_line = rope.char_to_line(line_index + start_char - count);
    let end_pos = rope.line_to_char(end_line);

    change_file_lsp(
        &file.filepath,
        end_line,
        line_index + start_char - count - end_pos,
        start_line,
        start_char,
        "",
        &state,
    );
    partial_semantic_tokens_lsp(&file.filepath, &state);
}

#[tauri::command]
pub fn update_file(file_index: usize, state: State<'_, AppState>) {
    let files = &state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();
    let rope = file.rope.lock().unwrap();

    rope.write_to(File::create(&file.filepath).unwrap())
        .unwrap();
}
