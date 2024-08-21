export enum VimModes {
	Normal = "normal",
	Insert = "insert",
	Visual = "visual",
	Command = "command"
}

export enum Panels {
	Editor,
	Sidebar
}


import { storeToRefs } from 'pinia';
import { VimState } from '../../state';
import { global } from './global/maps/normal';
import { normalEditor } from './editor/maps/normal';
import { insertEditor } from './editor/maps/insert';
import { commandRunner } from './commands/command';


export function vim_bindings(panel: Panels, key: string, ctrl: boolean, alt: boolean) {


	const store = VimState()
	const { vim_mode } = storeToRefs(store)


	switch (vim_mode.value) {
		case VimModes.Normal: normal(panel, key, ctrl, alt); break
		case VimModes.Insert: insert(panel, key, ctrl, alt); break
		case VimModes.Command: command(panel, key, ctrl, alt); break
	}
}

var keys = ""
var timeout: number
function normal(panel: Panels, key: string, ctrl: boolean, alt: boolean) {

	if (key === "Escape") {
		document.getElementById("keystrokes")!.textContent = ""
		keys = ""
		return
	}

	keys += ctrl ? "Control" : ''
	keys += alt ? "Alt" : ''
	keys += key
	document.getElementById("keystrokes")!.textContent = keys
	clearTimeout(timeout)

	if (global(keys)) {
		keys = ""
		return
	}

	switch (panel) {
		case Panels.Editor:
			if (normalEditor(keys)) {
				keys = ""
				return
			}
			break

		case Panels.Sidebar: return
	}


	timeout = setTimeout(() => {
		document.getElementById("keystrokes")!.textContent = ""
		keys = ""
	}, 1500)

}

function insert(panel: Panels, key: string, _ctrl: boolean, _alt: boolean) {
	if (panel === Panels.Editor) {
		insertEditor(key)
	}
}

function command(_panel: Panels, key: string, _ctrl: boolean, _alt: boolean) {
	console.log(key)
	commandRunner(key)
}
