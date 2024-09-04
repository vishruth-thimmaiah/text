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
import { normal_mode } from './common';


export function vim_bindings(panel: Panels, event: KeyboardEvent) {


	const key = event.key
	const ctrl = event.ctrlKey
	const alt = event.altKey

	const store = VimState()
	const { vim_mode } = storeToRefs(store)


	switch (vim_mode.value) {
		case VimModes.Normal:
			normal(panel, key, ctrl, alt);
			event.preventDefault()
			break
		case VimModes.Insert:
			if (insert(panel, key, ctrl, alt)) {
				event.preventDefault()
			}
			break
		case VimModes.Command:
			normal_mode()
			break
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
		return insertEditor(key)
	}
}
