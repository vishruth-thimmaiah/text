use std::fs::File;
use std::path::PathBuf;
use std::sync::Mutex;

use serde::Serialize;
use tauri::State;

use crate::{InnerAppState, OpenFiles};

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

#[derive(Debug, Serialize)]
struct Files {
    name: String,
}

#[derive(Debug, Serialize)]
pub struct Dirs {
    name: String,
    files: Vec<Files>,
    subdirs: Vec<Dirs>,
}

impl Dirs {
    fn from(name: String) -> Self {
        Self {
            name,
            files: Vec::new(),
            subdirs: Vec::new(),
        }
    }
}

fn add_contents(path: PathBuf, cwd: &mut Dirs) {
    let contents = path.read_dir().unwrap();

    for item in contents {
        if let Ok(item) = item {
            let filetype = item.file_type().unwrap();
            let filename = item.file_name().into_string().unwrap();
            if filetype.is_dir() {
                let nested_dir = path.join(filename);
                cwd.subdirs
                    .push(Dirs::from(nested_dir.to_str().unwrap().to_string()));
                add_contents(nested_dir, cwd.subdirs.last_mut().unwrap());
            } else if filetype.is_file() {
                cwd.files.push(Files { name: filename })
            }
        }
    }
}

#[tauri::command]
pub fn list_dirs(cwd: String, state: State<'_, Mutex<InnerAppState>>) -> Dirs {
    let root_dir = PathBuf::from(&cwd);
    state.lock().unwrap().active_dir = Some(cwd.clone());

    let mut dirs = Dirs::from(cwd);

    add_contents(root_dir, &mut dirs);

    dirs
}
