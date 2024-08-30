import { EditorState } from "../../../../state"
import { getCaretPos, newLine, removeLine } from "../../../cursor/index"
import * as binds from "../file"

export function insertEditor(key: string) {

	if (key === "Enter") {
		newLine()
		return true
	}
	//
	else if (key === "Backspace") {
		return removeLine()
	}
	//
	else if (key === "Escape") {
		const {cursor} = EditorState()
		console.log(getCaretPos())
		cursor.set(...getCaretPos())
		binds.save_file()
		return true
	}
}
