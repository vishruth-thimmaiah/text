export enum VimModes {
	Normal = "normal",
	Insert = "insert",
	Visual = "visual"
}

import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore, VimState } from '../state/index.ts';
import * as binds from './common.ts'
import { invoke } from '@tauri-apps/api';


export function vim_bindings(key: string) {
	const store = VimState()
	const { vim_mode } = storeToRefs(store)
	switch (vim_mode.value) {
		case VimModes.Normal: normal(key); break
		case VimModes.Insert: insert(key); break
		// case VimModes.Visual: visual(key); break
	}
}

var newstring = ""
var cursor_pos_row = 0
var cursor_pos_column = 0

var command = ""

function normal(key: string) {
	var localcmd = ""
	const store = EditorState()
	const vim = VimState()
	const { cursor } = storeToRefs(store)

	if (command !== "") {
		localcmd = command
		command = ""
	}

	switch (key) {
		// Motions
		case "l":
		case "ArrowRight":
			binds.move_right()
			break
		case "h":
		case "ArrowLeft":
			binds.move_left()
			break
		case "j":
		case "ArrowDown":
			binds.move_down()
			break
		case "k":
		case "ArrowUp":
			binds.move_up()
			break

		// insert
		case "i":
			vim.change_vim_mode(VimModes.Insert)
			cursor_pos_row = cursor.value.y / 18
			cursor_pos_column = (cursor.value.x - 40) / 8
			break
		case "a":
			binds.move_right()
			vim.change_vim_mode(VimModes.Insert)
			cursor_pos_row = cursor.value.y / 18
			console.log((cursor.value.x - 6) / 8, cursor.value.x)
			cursor_pos_column = (cursor.value.x - 40) / 8
			break

		default:
			command = localcmd + key
			console.log(command)
			break
	}
}


async function insert(key: string) {

	const store = EditorState()
	const { lines, active_tab, cursor } = storeToRefs(store)
	const { editor_top_height } = storeToRefs(GlobalStore())
	const vim = VimState()

	if (key.length === 1) {

		const x = cursor.value.x / 8 - 5
		const line = lines.value[cursor.value.y / 18]


		lines.value[cursor.value.y / 18] = line.substring(0, x) + key + line.substring(x)
		cursor.value.rset(1, 0)
		newstring += key

	} else if (key === "Escape") {

		binds.move_left()
		vim.change_vim_mode(VimModes.Normal)
		if (newstring !== "" && active_tab.value) {
			console.log(cursor_pos_row, editor_top_height.value, cursor_pos_column)
			await invoke("add_chars", { fileIndex: active_tab.value, chars: newstring, startLine: cursor_pos_row + editor_top_height.value, startPoint: cursor_pos_column })
			newstring = ""
		}
	}
}

// function visual(key: string) { }
