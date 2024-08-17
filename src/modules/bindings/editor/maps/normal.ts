import { storeToRefs } from "pinia"
import { GlobalStore } from "../../../../state"
import * as motions from "../motions"
import * as layout from "../../global"
import { command_mode } from "../../common"
import { insert_mode } from "../../common"

var cmd = ""
var timeout: number

export function normal(key: string, ctrl: boolean, alt: boolean) {
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
			layout.cycle_view(focus_on.value)
			return

		case ":":
			command_mode()
			return
	}

	if (focus_on.value === 0) {
		switch (localcmd + key) {

			// Motions
			case "l":
			case "ArrowRight":
				motions.move_right()
				return
			case "h":
			case "ArrowLeft":
				motions.move_left()
				return
			case "j":
			case "ArrowDown":
				motions.move_down()
				return
			case "k":
			case "ArrowUp":
				motions.move_up()
				return

			case "w":
				motions.next_word()
				return

			case "b":
				motions.prev_word()
				return

			// insert
			case "i":
				insert_mode()
				return
			case "a":
				motions.move_right()
				insert_mode()
				return

			case "ZZ":
				layout.close_tab()
				return
		}
	}

	cmd = localcmd + key
	timeout = setTimeout(() => {
		cmd = ""
	}, 1500)

}
