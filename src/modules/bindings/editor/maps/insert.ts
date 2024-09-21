import { storeToRefs } from "pinia"
import { EditorState } from "../../../../state"
import { getCaretPos, newLine, removeChar, updateLine } from "../../../cursor/insert"
import { updateSemTokens } from "../../../lsp/semanticTokens"
import * as binds from "../file"
import { FilesStore } from "../../../files/filedata"

export function insertEditor(key: string) {

	const { files, active_tab } = storeToRefs(FilesStore())
	updateSemTokens(files.value[active_tab.value!].filename)

	if (key.length === 1) {
		updateLine(key)
		return true
	}

	else if (key === "Enter") {
		newLine()
		return true
	}

	else if (key === "Backspace") {
		removeChar()
		return true
	}
	//
	else if (key === "Escape") {
		const { cursor } = EditorState()
		cursor.set(...getCaretPos())
		binds.saveFile()
		return true
	}
}
