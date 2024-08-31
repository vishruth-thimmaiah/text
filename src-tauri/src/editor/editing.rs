use std::fs::File;

use tauri::State;

use crate::InnerAppState;

#[tauri::command]
pub fn update_file(
    file_index: usize,
    chars: String,
    start_line: usize,
    state: State<'_, InnerAppState>,
) {
    let files = &state.files.lock().unwrap();
    let file = files.get(file_index).unwrap();
    let mut rope = file.rope.lock().unwrap();
    let line_index = rope.line_to_char(start_line);
    let line_end_index = rope.line_to_char(rope.len_lines());

    rope.remove(line_index..line_end_index);
    rope.insert(line_index, &chars);

    rope.write_to(File::create(&file.filepath).unwrap())
        .unwrap();
}
