import { storeToRefs } from "pinia"
import { GlobalStore } from "../../../state"

export function toggle() {
	const { show_sidebar } = storeToRefs(GlobalStore())
	show_sidebar.value = !show_sidebar.value
}

export function cycle_view(focused_element: number) {
	const elements = ["editor", "sidebar"]
	focused_element = focused_element > elements.length - 2 ? 0 : focused_element + 1
	document.getElementById(elements[focused_element])?.focus()
}
