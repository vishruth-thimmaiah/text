export enum VimModes {
	Normal = "normal",
	Insert = "insert",
	Visual = "visual",
	Command = "command"
}

import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore, VimState } from '../state/index.ts';
import * as binds from './common.ts'
import { ref } from 'vue';


export function vim_bindings(key: string, ctrl: boolean, alt: boolean) {

	document.getElementById("keystrokes")!.textContent = cmd + key

	const store = VimState()
	const { vim_mode } = storeToRefs(store)
	switch (vim_mode.value) {
		case VimModes.Normal: normal(key, ctrl, alt); break
		case VimModes.Insert: insert(key); break
		case VimModes.Command: command(key); break
		// case VimModes.Visual: visual(key); break
	}
}


var cmd = ""
var timeout: number

function normal(key: string, ctrl: boolean, alt: boolean) {
	var localcmd = ""
	localcmd += ctrl ? "Control" : ''
	localcmd += alt ? "Alt" : ''
	const { focus_on } = storeToRefs(GlobalStore())

	if (cmd !== "") {
		localcmd = cmd
		cmd = ""
		clearTimeout(timeout)
	}
	if (key === "Escape") {
		document.getElementById("keystrokes")!.textContent = ""
		return
	}

	// Globals
	switch (localcmd + key) {
		case "Controlww":
			binds.cycle_view(focus_on.value)
			return

		case ":":
			binds.command_mode()
			return
	}

	if (focus_on.value === 0) {
		switch (localcmd + key) {

			// Motions
			case "l":
			case "ArrowRight":
				binds.move_right()
				return
			case "h":
			case "ArrowLeft":
				binds.move_left()
				return
			case "j":
			case "ArrowDown":
				binds.move_down()
				return
			case "k":
			case "ArrowUp":
				binds.move_up()
				return

			case "w":
				binds.next_word()
				return

			case "b":
				binds.prev_word()
				return

			// insert
			case "i":
				binds.insert_mode()
				return
			case "a":
				binds.move_right()
				binds.insert_mode()
				return
		}
	}

	cmd = localcmd + key
	timeout = setTimeout(() => {
		cmd = ""
	}, 3000)

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
const command_list = Array.from(commands.keys())
export const ref_command_list = ref(command_list)

function command(key: string) {
	const store = VimState()
	const { command } = storeToRefs(store)
	switch (key) {
		case "Escape":
			store.change_vim_mode(VimModes.Normal)
			command.value = ""
			ref_command_list.value = command_list
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

			ref_command_list.value = command_list
			store.change_vim_mode(VimModes.Normal)
			command.value = ""
			break

		default:
			if (key.length === 1) {
				command.value += key
				//TODO replace with a better sort function
				ref_command_list.value = []
				for (const cmd of command_list) {
					if (cmd.toLowerCase().match(command.value)) {
						ref_command_list.value.push(cmd)
					}
				}
			}
			break
	}
}

// function visual(key: string) { }
