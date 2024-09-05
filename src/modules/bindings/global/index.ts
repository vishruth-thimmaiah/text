import { storeToRefs } from "pinia"
import { GlobalStore } from "../../../state"
import { Panels } from "../vim"
import { focusTerminal } from "../../terminal"

export function toggle_sidebar() {
	const { show_sidebar } = storeToRefs(GlobalStore())
	show_sidebar.value = !show_sidebar.value
}

export function toggle_terminal() {
	const { show_terminal } = storeToRefs(GlobalStore())
	show_terminal.value = !show_terminal.value
}

export function cycle_view(panel: Panels) {
	switch (panel) {
		case Panels.Editor:
			document.getElementById("sidebar")?.focus()
			break
		case Panels.Sidebar:
			focusTerminal()
			break
		case Panels.Terminal:
			document.getElementById("editor")?.focus()
			break
	}
}
