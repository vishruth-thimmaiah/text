import * as motions from "../motions"
import { insert_mode } from "../../common"
import { EditorState } from "../../../../state"
import { storeToRefs } from "pinia"
import { hover } from "../../../lsp/requests"
import { FilesStore } from "../../../files/filedata"

export function normalEditor(keys: string): boolean {
	const editor = EditorState()
	const { cursor } = storeToRefs(editor)
	switch (keys) {

		// Motions
		case "l":
		case "ArrowRight":
			motions.move_right()
			return true
		case "h":
		case "ArrowLeft":
			motions.move_left()
			return true
		case "j":
		case "ArrowDown":
			motions.move_down()
			return true
		case "k":
		case "ArrowUp":
			motions.move_up()
			return true

		case "gg":
			editor.cursor.set(0, 0)
			return true

		case "0":
			editor.cursor.set(0, cursor.value.y)
			return true

		case "w":
			motions.next_word()
			return true

		case "b":
			motions.prev_word()
			return true

		// insert
		case "i":
			insert_mode()
			return true
		case "a":
			motions.move_right()
			insert_mode()
			return true

		// lsp
		case "K":
			const {active_tab, files} = storeToRefs(FilesStore())
			hover(files.value[active_tab.value!].filename, cursor.value.y, cursor.value.x)
		return true

	}
	return false
}
