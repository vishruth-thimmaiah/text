use core::str;
use lsp_types::{
    SemanticTokensClientCapabilities, SemanticTokensClientCapabilitiesRequests,
    TextDocumentClientCapabilities, Uri,
};
use responses::handle_responses;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, json};
use std::collections::HashMap;
use std::fs;
use std::io::{BufRead, BufReader, Read, Write};
use std::process::{ChildStdin, Command};
use std::str::FromStr;
use std::sync::Mutex;
use std::thread::spawn;
use std::{env, process::Stdio};
use tauri::{AppHandle, State};

use crate::InnerAppState;

mod responses;

pub struct LspInfo {
    stdin: ChildStdin,
    sent_requests: Mutex<HashMap<usize, String>>,
    initialized: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct LspRequest<T> {
    jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    id: Option<usize>,
    method: String,
    params: T,
}

#[tauri::command]
pub fn start_lsp_server(app_handle: AppHandle, state: State<'_, InnerAppState>) -> Result<(), ()> {
    // let mut cmd =
    //     Command::new(env::var("HOME").unwrap() + "/.vscode-oss/extensions/rust-lang.rust-analyzer-0.3.2062-linux-x64/server/rust-analyzer");
    let mut cmd =
        Command::new("rust-analyzer");

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
        for line in stderr_reader.lines() {
            println!("{}", line.unwrap());
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

#[tauri::command]
pub fn initialize_lsp(root_dir: &str, state: State<'_, InnerAppState>) -> Result<(), ()> {
    let mut state = state.lsp.lock().unwrap();

    if state.as_ref().unwrap().initialized {
        return Ok(());
    }
    state.as_mut().unwrap().initialized = true;

    let mut stdin = &state.as_ref().unwrap().stdin;
    let mut id = state.as_ref().unwrap().sent_requests.lock().unwrap();
    id.insert(1, "initialize".to_string());

    #[allow(deprecated)]
    let params = lsp_types::InitializeParams {
        root_uri: Some(Uri::from_str(&("file://".to_owned() + root_dir)).unwrap()),
        capabilities: lsp_types::ClientCapabilities {
            text_document: Some(TextDocumentClientCapabilities {
                hover: Some(lsp_types::HoverClientCapabilities {
                    ..Default::default()
                }),
                semantic_tokens: Some(SemanticTokensClientCapabilities {
                    requests: SemanticTokensClientCapabilitiesRequests {
                        range: Some(true),
                        ..Default::default()
                    },
                    ..Default::default()
                }),
                ..Default::default()
            }),
            ..Default::default()
        },
        initialization_options: Some(json!({"semanticTokens": true, "hover": true})),
        ..Default::default()
    };

    let lsp = LspRequest {
        jsonrpc: "2.0".to_string(),
        id: Some(1),
        method: "initialize".to_string(),
        params,
    };
    let serialized_req = serde_json::to_string(&lsp).unwrap();

    let _ = stdin.write(
        format!(
            "Content-Length: {}\r\n\r\n{}",
            serialized_req.len(),
            serialized_req
        )
        .as_bytes(),
    );

    Ok(())
}

#[tauri::command]
pub fn initialized_lsp(state: State<'_, InnerAppState>) -> Result<(), ()> {
    let state = state.lsp.lock().unwrap();
    let mut stdin = &state.as_ref().unwrap().stdin;

    let mut id = state.as_ref().unwrap().sent_requests.lock().unwrap();
    id.insert(1, "initialized".to_string());
    let lsp = LspRequest {
        jsonrpc: "2.0".to_string(),
        id: None,
        method: "initialized".to_string(),
        params: lsp_types::InitializedParams {},
    };

    let serialized_req = serde_json::to_string(&lsp).unwrap();

    let _ = stdin.write(
        format!(
            "Content-Length: {}\r\n\r\n{}",
            serialized_req.len(),
            serialized_req
        )
        .as_bytes(),
    );

    Ok(())
}

#[tauri::command]
pub fn open_file_lsp(filepath: &str, state: State<'_, InnerAppState>) {
    let state = state.lsp.lock().unwrap();
    let mut stdin = &state.as_ref().unwrap().stdin;
    let file = fs::read_to_string(filepath).unwrap();

    let lsp = LspRequest {
        jsonrpc: "2.0".to_string(),
        id: None,
        method: "textDocument/didOpen".to_string(),
        params: lsp_types::DidOpenTextDocumentParams {
            text_document: lsp_types::TextDocumentItem {
                uri: Uri::from_str(&("file://".to_owned() + filepath)).unwrap(),
                language_id: "rust".to_string(),
                version: 1,
                text: file,
            },
        },
    };

    let serialized_req = serde_json::to_string(&lsp).unwrap();

    let _ = stdin.write(
        format!(
            "Content-Length: {}\r\n\r\n{}",
            serialized_req.len(),
            serialized_req
        )
        .as_bytes(),
    );
}

#[tauri::command]
pub fn semantic_tokens_lsp(filepath: &str, state: State<'_, InnerAppState>) {
    let state = state.lsp.lock().unwrap();
    let mut stdin = &state.as_ref().unwrap().stdin;
    let mut id = state.as_ref().unwrap().sent_requests.lock().unwrap();
    id.insert(2, "textDocument/semanticTokens/full".to_string());

    let lsp = LspRequest {
        jsonrpc: "2.0".to_string(),
        id: Some(2),
        method: "textDocument/semanticTokens/full".to_string(),
        params: lsp_types::SemanticTokensParams {
            text_document: lsp_types::TextDocumentIdentifier {
                uri: Uri::from_str(&("file://".to_owned() + filepath)).unwrap(),
            },
            partial_result_params: lsp_types::PartialResultParams {
                partial_result_token: None,
            },
            work_done_progress_params: lsp_types::WorkDoneProgressParams {
                work_done_token: None,
            },
        },
    };

    let serialized_req = serde_json::to_string(&lsp).unwrap();
    let _ = stdin.write(
        format!(
            "Content-Length: {}\r\n\r\n{}",
            serialized_req.len(),
            serialized_req
        )
        .as_bytes(),
    );
}

#[tauri::command]
pub fn hover_lsp(filepath: &str, line: u32, character: u32, state: State<'_, InnerAppState>) {
    let state = state.lsp.lock().unwrap();
    let mut stdin = &state.as_ref().unwrap().stdin;

    let mut id = state.as_ref().unwrap().sent_requests.lock().unwrap();
    id.insert(3, "textDocument/hover".to_string());
    let lsp = LspRequest {
        jsonrpc: "2.0".to_string(),
        id: Some(3),
        method: "textDocument/hover".to_string(),
        params: lsp_types::HoverParams {
            work_done_progress_params: lsp_types::WorkDoneProgressParams {
                work_done_token: None,
            },
            text_document_position_params: lsp_types::TextDocumentPositionParams {
                text_document: lsp_types::TextDocumentIdentifier {
                    uri: Uri::from_str(&("file://".to_owned() + filepath)).unwrap(),
                },
                position: lsp_types::Position { line, character },
            },
        },
    };

    let serialized_req = serde_json::to_string(&lsp).unwrap();

    let _ = stdin.write(
        format!(
            "Content-Length: {}\r\n\r\n{}",
            serialized_req.len(),
            serialized_req
        )
        .as_bytes(),
    );
}
