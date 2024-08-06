export enum VimModes {
	Normal = "normal",
	Insert = "insert",
	Visual = "visual"
}

import { storeToRefs } from 'pinia';
import { VimState } from '../state/index.ts';
import * as binds from './common.ts'


export function vim_bindings(key: string) {
	const store = VimState()
	const { vim_mode } = storeToRefs(store)
	switch (vim_mode.value) {
		case VimModes.Normal: normal(key); break
		case VimModes.Insert: insert(key); break
		// case VimModes.Visual: visual(key); break
	}
}


var command = ""

function normal(key: string) {
	var localcmd = ""

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
			binds.insert_mode()
			break
		case "a":
			binds.move_right()
			binds.insert_mode()
			break

		default:
			command = localcmd + key
			console.log(command)
			break
	}
}


async function insert(key: string) {


	if (key.length === 1) {
		binds.insert_char(key)

	} else if (key === "Escape") {
		binds.save_file()
	}
}

// function visual(key: string) { }
