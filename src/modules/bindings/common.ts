import { storeToRefs } from "pinia"
import { EditorState, VimState } from "../../state"
import { VimModes } from "./vim"
import { setCaretPos } from "../cursor/insert"
import { nextTick } from "vue"

export function normal_mode() {
	const vim = VimState()
	vim.change_vim_mode(VimModes.Normal)
	document.getElementById("editor")?.focus()
}

export function insert_mode() {
	const vim = VimState()
	const { cursor } = storeToRefs(EditorState())
	setCaretPos(cursor.value.x, cursor.value.y)
	vim.change_vim_mode(VimModes.Insert)
}

export function command_mode() {
	const vim = VimState()
	vim.change_vim_mode(VimModes.Command)
	nextTick(() => {
		document.getElementById("command-mode-input")?.focus()
	})
}
