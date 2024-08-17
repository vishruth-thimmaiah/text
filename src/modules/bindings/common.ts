import { storeToRefs } from "pinia"
import { EditorState, VimState } from "../../state"
import { VimModes } from "./vim"

export var cursor_pos_row = 0
export var cursor_pos_column = 0

export function cursor_pos_c(pos: number) {
	cursor_pos_column = pos
}

export function insert_mode() {
	const vim = VimState()
	const { cursor } = storeToRefs(EditorState())
	vim.change_vim_mode(VimModes.Insert)
	cursor_pos_row = cursor.value.y
	cursor_pos_column = cursor.value.x
}

export function command_mode() {
	const vim = VimState()
	vim.change_vim_mode(VimModes.Command)
}
