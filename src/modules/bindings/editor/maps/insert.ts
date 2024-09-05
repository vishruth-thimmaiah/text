import { EditorState } from "../../../../state"
import { getCaretPos, newLine, removeChar, updateLine } from "../../../cursor/insert"
import * as binds from "../file"

export function insertEditor(key: string) {

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
