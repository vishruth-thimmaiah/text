import { storeToRefs } from "pinia"
import { EditorState, GlobalStore } from "../../../state"
import { invoke } from "@tauri-apps/api"

export function toggle() {
	const { show_sidebar } = storeToRefs(GlobalStore())
	show_sidebar.value = !show_sidebar.value
}

export function cycle_view(focused_element: number) {
	const elements = ["editor", "sidebar"]
	focused_element = focused_element > elements.length - 2 ? 0 : focused_element + 1
	document.getElementById(elements[focused_element])?.focus()
}

export async function close_tab() {
	const { active_tab, lines } = storeToRefs(EditorState())
	const { tabs, editor_down_height } = storeToRefs(GlobalStore())
	tabs.value.splice(active_tab.value!, 1)
	invoke<string[]>("close_file", { fileIndex: active_tab.value })
	active_tab.value! -= 1

	lines.value = await invoke<string[]>("file_lines", { fileIndex: active_tab.value, startPos: 0, endPos: editor_down_height.value })
}
