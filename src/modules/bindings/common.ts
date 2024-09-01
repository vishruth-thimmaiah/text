import { storeToRefs } from "pinia"
import { EditorState, VimState } from "../../state"
import { VimModes } from "./vim"
import { setCaretPos } from "../cursor/insert"

export function insert_mode() {
	const vim = VimState()
	const { cursor } = storeToRefs(EditorState())
	console.log(cursor.value)
	setCaretPos(cursor.value.x, cursor.value.y)
	vim.change_vim_mode(VimModes.Insert)
}

export function command_mode() {
	const vim = VimState()
	vim.change_vim_mode(VimModes.Command)
}
