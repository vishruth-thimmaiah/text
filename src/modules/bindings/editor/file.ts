import { storeToRefs } from "pinia"
import { VimState } from "../../../state"
import { move_left } from "./motions"
import { VimModes } from "../vim"
import { FilesStore } from "../../files/filedata"

var newstring = ""
var remvd = 0

export async function saveFile() {
	move_left()
	const vim = VimState()
	const { active_tab } = storeToRefs(FilesStore())
	vim.change_vim_mode(VimModes.Normal)
	if (remvd && active_tab.value !== null) {
		// await invoke("remove_chars", { fileIndex: active_tab.value, count: remvd, startLine: cursor_pos_row, startPoint: cursor_pos_column })
		remvd = 0
	}
	if (newstring !== "" && active_tab.value !== null) {
		// await invoke("add_chars", { fileIndex: active_tab.value, chars: newstring, startLine: cursor_pos_row, startPoint: cursor_pos_column })
		newstring = ""
	}
}
