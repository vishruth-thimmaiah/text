export enum VimModes {
	Normal = "normal",
	Insert = "insert",
	Visual = "visual",
	Command = "command"
}

export enum Panels {
	Global,
	Editor,
	Sidebar
}

import { storeToRefs } from 'pinia';
import { VimState } from '../../state';
import { normal as editorN } from './editor/maps/normal';
import { insert as editorI } from './editor/maps/insert';
import { command } from './commands/command';


export function vim_bindings(panel: Panels, key: string, ctrl: boolean, alt: boolean) {

	document.getElementById("keystrokes")!.textContent = key

	const store = VimState()
	const { vim_mode } = storeToRefs(store)



	switch (panel) {
		case Panels.Editor:
			switch (vim_mode.value) {
				case VimModes.Normal: editorN(key, ctrl, alt); break
				case VimModes.Insert: editorI(key); break
				case VimModes.Command: command(key); break
			}
			break
		case Panels.Sidebar:
			break
	}

}
