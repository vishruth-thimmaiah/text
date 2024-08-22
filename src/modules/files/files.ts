import { invoke } from "@tauri-apps/api"
import { storeToRefs } from "pinia"
import { GlobalStore } from "../../state"
import { FilesStore } from "./filedata"


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
	return res
}

export async function OpenFile(filepath: string): Promise<void> {
	const { tabs } = storeToRefs(GlobalStore())
	const { newFile, getLines } = FilesStore()

	const filename = filepath.split('/').pop()!
	const index = tabs.value.indexOf(filename)
	if (index === -1) {
		tabs.value.push(filename)
		const index = await newFile(filepath)
		await getLines(index)
	}
}

export async function CloseFile(index: number = -1): Promise<void> {
	const { active_tab } = storeToRefs(FilesStore())
	const { tabs } = storeToRefs(GlobalStore())
	index = index >= 0 ? index : active_tab.value || -1
	if (index !== -1) {
		tabs.value.splice(index, 1)
		const { closeFile } = FilesStore()
		await closeFile(index)
	}
}
