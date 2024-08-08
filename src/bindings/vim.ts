export enum VimModes {
	Normal = "normal",
	Insert = "insert",
	Visual = "visual",
	Command = "command"
}

import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore, VimState } from '../state/index.ts';
import * as binds from './common.ts'


export function vim_bindings(key: string) {
	const store = VimState()
	const { vim_mode } = storeToRefs(store)
	switch (vim_mode.value) {
		case VimModes.Normal: normal(key); break
		case VimModes.Insert: insert(key); break
		case VimModes.Command: command(key); break
		// case VimModes.Visual: visual(key); break
	}
}


var cmd = ""

function normal(key: string) {
	var localcmd = ""
	const { focus_on } = storeToRefs(GlobalStore())

	if (cmd !== "") {
		localcmd = cmd
		cmd = ""
	}

	// Globals
	switch (key) {
		// TODO: change this binding once multiple key bindings are supported
		case "W":
			binds.cycle_view(focus_on.value)
			return

		case ":":
			binds.command_mode()
			return

	}

	if (focus_on.value === 1) {
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

			case "w":
				binds.next_word()
				break

			case "b":
				binds.prev_word()
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
				cmd = localcmd + key
				break
		}
	}

}


async function insert(key: string) {


	if (key.length === 1) {
		binds.insert_char(key)

	}

	else if (key === "Enter") {
		binds.newline()
	}

	else if (key === "Backspace") {
		binds.remove_char()
	}

	else if (key === "Escape") {
		binds.save_file()
	}
}

function toggle() {
	const { show_sidebar } = storeToRefs(GlobalStore())
	show_sidebar.value = !show_sidebar.value
}

const commands = new Map<string, Function>()
commands.set("Explore", toggle)

function command(key: string) {
	const store = VimState()
	const { command } = storeToRefs(store)
	switch (key) {
		case "Escape":
			store.change_vim_mode(VimModes.Normal)
			command.value = ""
			break
		case "Backspace": {
			command.value = command.value.slice(0, -1)
			break
		}

		case "Enter":
			const c = commands.get(command.value)
			if (c !== undefined) {
				c()
			}
			else if (command.value.match(/(\d)+/)) {
				const { cursor } = storeToRefs(EditorState())
				cursor.value.set(5, Number(command.value) - 1)
			}
			store.change_vim_mode(VimModes.Normal)
			command.value = ""
			break

		default:
			if (key.length === 1) {
				command.value += key
			}
			break
	}
}

// function visual(key: string) { }
