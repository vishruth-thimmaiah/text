import { storeToRefs } from "pinia"
import { EditorState, GlobalStore, VimState } from "../../../state"
import { move_left } from "./motions"
import { VimModes } from "../vim"
import { invoke } from "@tauri-apps/api"
import { cursor_pos_c, cursor_pos_column, cursor_pos_row } from "../common"

var newstring = ""
var remvd = 0
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
		cursor_pos_c(cursor_pos_column - remvd)
		remvd = 0
	}
	if (newstring !== "" && active_tab.value !== null) {
		await invoke("add_chars", { fileIndex: active_tab.value, chars: newstring, startLine: cursor_pos_row + editor_top_height.value, startPoint: cursor_pos_column })
		newstring = ""
	}
}
