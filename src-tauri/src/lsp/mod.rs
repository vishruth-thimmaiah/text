use core::str;
use download::get_lsp_bin_path;
use responses::handle_responses;
use serde_json::from_str;
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, Read, Write};
use std::process::Stdio;
use std::process::{ChildStdin, Command};
use std::sync::Mutex;
use std::thread::spawn;
use tauri::{AppHandle, State};

use crate::AppState;

mod download;
pub mod requests;
mod responses;

const LOG_LSP: bool = false;

pub struct LspInfo {
    stdin: ChildStdin,
    sent_requests: Mutex<HashMap<usize, String>>,
    initialized: bool,
}
#[tauri::command]
pub async fn start_lsp_server(app_handle: AppHandle, state: State<'_, AppState>) -> Result<(), ()> {
    let downloads_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .unwrap()
        .join("lsp");
    let path = get_lsp_bin_path(downloads_dir, download::Languages::Rust).await;

    if path.is_err() {
        return Err(());
    }

    let path = path.unwrap();

    let mut cmd = Command::new(path);

    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());
    cmd.stdin(Stdio::piped());

    let mut child = cmd.spawn().expect("failed to spawn command");

    let stdout = child
        .stdout
        .take()
        .expect("child did not have a handle to stdout");

    let stdin = child
        .stdin
        .take()
        .expect("child did not have a handle to stdin");

    let stderr = child
        .stderr
        .take()
        .expect("child did not have a handle to stderr");

    spawn(move || {
        child.wait().expect("Err lsp");
    });

    let log_file = app_handle.path_resolver().app_log_dir().unwrap();

    spawn(move || {
        let mut stdout_reader = BufReader::new(stdout);
        loop {
            let mut reader = String::new();
            let r = stdout_reader.read_line(&mut reader).unwrap();
            if r == 0 {
                println!("stdout_end");
                break;
            }
            if reader.starts_with("Content-Length: ") {
                let content_length = from_str(&reader[16..]).unwrap();

                stdout_reader.consume(2);

                let mut raw_vec = vec![0u8; content_length];
                stdout_reader.read_exact(&mut raw_vec).unwrap();

                let response = str::from_utf8(&raw_vec).unwrap();

                handle_responses(response, &app_handle);
            }
        }
    });

    spawn(move || {
        let stderr_reader = BufReader::new(stderr);
        if LOG_LSP {
            let mut file = OpenOptions::new()
                .append(true)
                .create(true)
                .open(log_file)
                .expect("Failed to open log file.");

            for line in stderr_reader.bytes() {
                file.write(&[line.unwrap()])
                    .expect("Failed to write to log file");
            }
        }
    });

    let mut state = state.lsp.lock().unwrap();
    if state.is_none() {
        *state = Some(LspInfo {
            stdin,
            sent_requests: Mutex::new(HashMap::new()),
            initialized: false,
        });
    }

    Ok(())
}
