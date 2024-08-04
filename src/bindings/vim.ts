export enum VimModes {
	Normal = "normal",
	Insert = "insert",
	Visual = "visual"
}

import { storeToRefs } from 'pinia';
import { UseStore } from '../state/index.ts';
import * as binds from './common.ts'
import { invoke } from '@tauri-apps/api';


export function vim_bindings(key: string) {
	const store = UseStore()
	const { vim_mode } = storeToRefs(store)
	switch (vim_mode.value) {
		case VimModes.Normal: normal(key); break
		case VimModes.Insert: insert(key); break
		case VimModes.Visual: visual(key); break
	}
}

var newstring = ""
var cursor_pos_row = 0
var cursor_pos_column = 0

var command = ""

function normal(key: string) {
	const cursor = document.getElementById("cursor")!
	const store = UseStore()

	switch (key) {
		// Motions
		case "l":
		case "ArrowRight":
			binds.move_right(cursor)
			break
		case "h":
		case "ArrowLeft":
			binds.move_left(cursor)
			break
		case "j":
		case "ArrowDown":
			binds.move_down(cursor)
			break
		case "k":
		case "ArrowUp":
			binds.move_up(cursor)
			break
		case "i":
			store.change_vim_mode(VimModes.Insert)
			const left_incr = (window.getComputedStyle(cursor)).left.match(/(\d)+/g)!
			const top_incr = (window.getComputedStyle(cursor)).top.match(/(\d)+/g)!
			cursor_pos_column = Math.floor((Number(left_incr)) / 8)
			cursor_pos_row = Math.floor((Number(top_incr) - 16) / 18)
			break
		default:
			command += key
			break
	}
}


async function insert(key: string) {

	const store = UseStore()
	const { lines, active_tab } = storeToRefs(store)

	const cursor = document.getElementById("cursor")!
	const left_incr = (window.getComputedStyle(cursor)).left.match(/(\d)+/g)!
	const top_incr = (window.getComputedStyle(cursor)).top.match(/(\d)+/g)!
	const column = Math.floor((Number(left_incr)) / 8)
	const row = Math.floor((Number(top_incr) - 16) / 18)
	if (key.length === 1) {

		lines.value[row] = lines.value[row].substring(0, column) + key + lines.value[row].substring(column)
		cursor.style.left = `${Number(left_incr) + 8}px`
		newstring += key

	} else if (key === "Escape") {
		store.change_vim_mode(VimModes.Normal)
		await invoke("add_chars", { fileIndex: active_tab.value, chars: newstring, startLine: cursor_pos_row, startPoint: cursor_pos_column })
	}
}

function visual(key: string) { }
