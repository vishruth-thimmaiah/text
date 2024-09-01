import { EditorState } from "../../../../state"
import { getCaretPos, newLine, removeLine } from "../../../cursor/insert"
import * as binds from "../file"

export function insertEditor(key: string) {

	if (key === "Enter") {
		newLine()
		return true
	}

	else if (key === "Backspace") {
		return removeLine()
	}

	else if (key === "Escape") {
		const { cursor } = EditorState()
		cursor.set(...getCaretPos())
		binds.saveFile()
		return true
	}
}
