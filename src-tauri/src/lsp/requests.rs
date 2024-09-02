use core::str;
use lsp_types::{
    SemanticTokensClientCapabilities, SemanticTokensClientCapabilitiesRequests,
    TextDocumentClientCapabilities, Uri,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::io::Write;
use std::str::FromStr;
use tauri::State;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
struct LspRequest<T> {
    jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    id: Option<usize>,
    method: String,
    params: T,
}

#[tauri::command]
pub fn initialize_lsp(root_dir: &str, state: State<'_, AppState>) -> Result<(), ()> {
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
            window: Some(lsp_types::WindowClientCapabilities {
                work_done_progress: Some(true),
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
pub fn initialized_lsp(state: State<'_, AppState>) -> Result<(), ()> {
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
pub fn open_file_lsp(filepath: &str, state: State<'_, AppState>) {
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
pub fn semantic_tokens_lsp(filepath: &str, state: State<'_, AppState>) {
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
pub fn hover_lsp(filepath: &str, line: u32, character: u32, state: State<'_, AppState>) {
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
