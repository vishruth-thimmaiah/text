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
var remvd = 0
var cursor_pos_row = 0
var cursor_pos_column = 0
export function insert_char(char: string) {
	const { cursor, lines } = storeToRefs(EditorState())

	const x = cursor.value.x
	const line = lines.value[cursor.value.y]

	lines.value[cursor.value.y] = line.substring(0, x) + char + line.substring(x)
	cursor.value.rset(1, 0)
	newstring += char
}


export function newline() {
	const { cursor, lines } = storeToRefs(EditorState())

	const x = cursor.value.x
	const line = lines.value[cursor.value.y]

	lines.value[cursor.value.y] = line.substring(0, x)
	lines.value.splice(cursor.value.y + 1, 0, line.substring(x))
	cursor.value.set(0, cursor.value.y + 1)
	newstring += "\n"
}

export function remove_char() {
	const { cursor, lines } = storeToRefs(EditorState())

	const x = cursor.value.x
	const line = lines.value[cursor.value.y]

	lines.value[cursor.value.y] = line.substring(0, x - 1) + line.substring(x)
	cursor.value.rset(-1, 0)
	if (newstring !== "") {
		newstring = newstring.slice(0, -1)
	} else {
		remvd += 1
	}
}

export async function save_file() {
	move_left()
	const vim = VimState()
	const { active_tab } = storeToRefs(EditorState())
	const { editor_top_height } = storeToRefs(GlobalStore())
	vim.change_vim_mode(VimModes.Normal)
	if (remvd && active_tab.value !== null) {
		await invoke("remove_chars", { fileIndex: active_tab.value, count: remvd, startLine: cursor_pos_row + editor_top_height.value, startPoint: cursor_pos_column })
		cursor_pos_column -= remvd
		remvd = 0
	}
	if (newstring !== "" && active_tab.value !== null) {
		await invoke("add_chars", { fileIndex: active_tab.value, chars: newstring, startLine: cursor_pos_row + editor_top_height.value, startPoint: cursor_pos_column })
		newstring = ""
	}
}

export function next_word() {
	var count = 0
	const { cursor, lines } = storeToRefs(EditorState())
	for (const letter of lines.value[cursor.value.y].substring(cursor.value.x + 1)) {
		if (letter.match(/[a-zA-Z0-9]/)) {
			count += 1
		} else if (letter !== " ") {
			cursor.value.rset(count + 1, 0)
			count = 0
			break
		} else {
			cursor.value.rset(count + 2, 0)
			count = 0
			break
		}
	}
}
export function prev_word() {
	var count = 0
	const { cursor, lines } = storeToRefs(EditorState())
	const line = lines.value[cursor.value.y].substring(0, cursor.value.x)
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
			cursor.value.rset(-count - 2, 0)
			count = 0
			break
		}
	}
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
