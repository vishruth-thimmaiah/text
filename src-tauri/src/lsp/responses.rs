use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Manager};

use crate::InnerAppState;

#[derive(Debug, Deserialize)]
struct LspResponse<'a> {
    #[allow(dead_code)]
    jsonrpc: String,
    #[allow(dead_code)]
    id: Option<usize>,
    params: Option<Value>,
    result: Option<Value>,
    method: Option<&'a str>,
}

#[derive(Clone, Debug, Serialize)]
pub struct ClientResponse {
    r#type: String,
    content: Option<Value>,
}

pub fn handle_responses(response: &str, app: &AppHandle) {
    let output = serde_json::from_str::<LspResponse>(&response);
    let state = app.state::<InnerAppState>();

    if output.is_err() {
        return;
    }

    let state = state.lsp.lock().unwrap();
    let mut sent_requests = state.as_ref().unwrap().sent_requests.lock().unwrap();

    let output = output.unwrap();

    if let Some(id) = output.id {
        if let Some(request) = sent_requests.remove(&id) {
            app.emit_all(
                "lsp_response",
                ClientResponse {
                    r#type: request.clone(),
                    content: match request.as_str() {
                        "initialize" => initialize(output.result.unwrap()),
                        "textDocument/semanticTokens/full" => {
                            semantic_tokens(output.result.unwrap())
                        }
                        "textDocument/hover" => hover(output.result.unwrap()),
                        _ => return,
                    },
                },
            )
            .unwrap();
            return;
        }
    }

    if output.method.is_some() {
        app.emit_all(
            "lsp_response",
            ClientResponse {
                r#type: output.method.unwrap().to_string(),
                content: match output.method.unwrap() {
                    "textDocument/publishDiagnostics" => {
                        publish_diagnostics(output.params.unwrap())
                    }
                    _ => return,
                },
            },
        )
        .unwrap();
        return;
    }
}

fn initialize(params: Value) -> Option<Value> {
    let tokens = params
        .pointer("/capabilities/semanticTokensProvider/legend")
        .unwrap();

    Some(tokens.to_owned())
}

fn publish_diagnostics(params: Value) -> Option<Value> {
    let diagnostics = params.get("diagnostics").unwrap();

    Some(diagnostics.to_owned())
}

fn semantic_tokens(params: Value) -> Option<Value> {
    let data = params.get("data").unwrap();

    Some(data.to_owned())
}

fn hover(params: Value) -> Option<Value> {
    let contents = params.get("contents").unwrap();

    Some(contents.to_owned())
}
