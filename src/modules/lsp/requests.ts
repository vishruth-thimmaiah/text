import { invoke } from "@tauri-apps/api"
import { listen } from "@tauri-apps/api/event"
import { setSemTokens, setTokenTypes } from "./semanticTokens"
import { storeToRefs } from "pinia"
import { EditorState } from "../../state"

var lsp_initialized = false

export function initialize_lsp(rootDir: string) {
	invoke("initialize_lsp", { rootDir })
}

export function open_file(filepath: string) {
	if (lsp_initialized) {
		invoke("open_file_lsp", { filepath })
		semantic_tokens(filepath)
	}
	else {
		requested_actions.push(open_file.bind(null, filepath))
	}
}

export function semantic_tokens(filepath: string) {
	if (lsp_initialized) {
		invoke("semantic_tokens_lsp", { filepath })
	}
}

export function hover(filepath: string, line: number, character: number) {
	if (lsp_initialized) {
		invoke("hover_lsp", { filepath, line, character })
	}
}

var requested_actions: Function[] = []
function on_load() {
	while (requested_actions.length > 0) {
		const func = requested_actions.pop()!
		func()
	}
}

interface response {
	type: string,
	content: any
}

listen<response>("lsp_response", (event) => {
	switch (event.payload.type) {
		case "initialize":
			invoke("initialized_lsp")
			setTokenTypes(event.payload.content)
			break

		case "textDocument/semanticTokens/full":
			setSemTokens(event.payload.content)
			break
		case "textDocument/publishDiagnostics":
			break
		case "textDocument/hover":
			const { hoverText } = storeToRefs(EditorState())
			hoverText.value = event.payload.content.value
			break
		case "$/progress":
			if (event.payload.content) {
				document.getElementById("lspProgress")!.textContent = event.payload.content
			}
			if (event.payload.content == "complete") {
				lsp_initialized = true
				on_load()
			}
			break
		default:
			break
	}
})
