import { invoke } from "@tauri-apps/api"
import { EditorState, GlobalStore } from "../../state"
import { storeToRefs } from "pinia"


interface Files {
	name: string
}

export interface Dirs {
	name: string,
	subdirs: Dirs[]
	files: Files[]
}

export async function ListDirs(selected_dir: string): Promise<Dirs> {
	const res = await invoke<Dirs>("list_dirs", { cwd: selected_dir })
	console.log(res)
	return res
}

export async function open_file(file: string) {

	const { tabs, editor_down_height } = storeToRefs(GlobalStore())
	const { lines, active_tab } = storeToRefs(EditorState())
	const file_name = file.split('/').pop()!
	const index = tabs.value.indexOf(file_name)
	if (index === -1) {
		await invoke("open_file", { filepath: file })
		tabs.value.push(file_name)
		active_tab.value = tabs.value.length - 1
		lines.value = await invoke<string[]>("file_lines", { fileIndex: active_tab.value, startPos: 0, endPos: editor_down_height.value })
	}
	else {
		active_tab.value = index
		lines.value = await invoke<string[]>("file_lines", { fileIndex: index, startPos: 0, endPos: editor_down_height.value })
	}
}

