import { invoke } from "@tauri-apps/api"

export function initialize_lsp(rootDir: string) {

	invoke("initialize_lsp", { rootDir })
	setTimeout(() => {
		invoke("initialized_lsp")
	}, 2000)
}

export function open_file(filepath: string) {
	invoke("open_file_lsp", { filepath })
}

export function semantic_tokens(filepath: string) {
	invoke("semantic_tokens_lsp", {filepath})
}

export function hover(filepath: string, line: number, character: number) {
	invoke("hover_lsp", {filepath, line, character})
}
