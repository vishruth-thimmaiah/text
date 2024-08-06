import { storeToRefs } from "pinia"
import { EditorState, GlobalStore, VimState } from "../state"
import { VimModes } from "./vim"
import { invoke } from "@tauri-apps/api"

export function move_right() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(1, 0)
}
export function move_left() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(-1, 0)
}
export function move_down() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(0, 1)
}
export function move_up() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(0, -1)
}

var newstring = ""
var cursor_pos_row = 0
var cursor_pos_column = 0
export function insert_char(char: string) {
	const { cursor, lines } = storeToRefs(EditorState())

	const x = cursor.value.x / 8 - 5
	const line = lines.value[cursor.value.y / 18]


	lines.value[cursor.value.y / 18] = line.substring(0, x) + char + line.substring(x)
	cursor.value.rset(1, 0)
	newstring += char
}

export async function save_file() {
	move_left()
	const vim = VimState()
	const { active_tab } = storeToRefs(EditorState())
	const { editor_top_height } = storeToRefs(GlobalStore())
	vim.change_vim_mode(VimModes.Normal)
	if (newstring !== "" && active_tab.value !== null) {
		await invoke("add_chars", { fileIndex: active_tab.value, chars: newstring, startLine: cursor_pos_row + editor_top_height.value, startPoint: cursor_pos_column })
		newstring = ""
	}
}

export function next_word() {
	var count = 0
	const { cursor, lines } = storeToRefs(EditorState())
	for (const letter of lines.value[cursor.value.y/18].substring(cursor.value.x/8-4)) {
		if (letter.match(/[a-zA-Z0-9]/)) {
			count += 1
		}
		else if (letter !== " ") {
			cursor.value.rset(count+1, 0)
			count = 0
			break
		} 
		else {
			cursor.value.rset(count+2, 0)
			count = 0
			break
		}
	}
}
export function prev_word() {
	var count = 0
	const { cursor, lines } = storeToRefs(EditorState())
	const line = lines.value[cursor.value.y/18].substring(0, cursor.value.x/8-6)
	for (const letter of line.split('').reverse().join('')) {
		if (letter.match(/[a-zA-Z0-9]/)) {
			count += 1
		}
		else if (letter !== " ") {
			cursor.value.rset(-count, 0)
			count = 0
			break
		} 
		else {
			cursor.value.rset(-count-1, 0)
			count = 0
			break
		}
	}
}


export function insert_mode() {
	const vim = VimState()
	const { cursor } = storeToRefs(EditorState())
	vim.change_vim_mode(VimModes.Insert)
	cursor_pos_row = cursor.value.y / 18
	cursor_pos_column = (cursor.value.x - 40) / 8
}

export function command_mode() {
	const vim = VimState()
	vim.change_vim_mode(VimModes.Command)
}
