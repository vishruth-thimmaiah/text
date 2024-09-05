import { storeToRefs } from "pinia"
import { VimState } from "../../../state"
import { move_left } from "./motions"
import { VimModes } from "../vim"
import { FilesStore } from "../../files/filedata"
import { invoke } from "@tauri-apps/api"

export async function saveFile() {
	move_left()
	const vim = VimState()
	vim.change_vim_mode(VimModes.Normal)
	document.getElementById("editor")?.focus()

	saveFileToBackend()
}

function saveFileToBackend() {
	const { active_tab } = storeToRefs(FilesStore())
	invoke("update_file", { fileIndex: active_tab.value, })
}
