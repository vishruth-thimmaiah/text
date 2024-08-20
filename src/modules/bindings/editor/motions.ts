import { EditorState } from "../../../state"
import { storeToRefs } from "pinia"
import { FilesStore } from "../../files/filedata"

export function move_right() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(1, 0)
}
export function move_left() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(-1, 0)
}
export function move_down() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(0, 1)
}
export function move_up() {
	const { cursor } = storeToRefs(EditorState())
	cursor.value.rset(0, -1)
}
export function next_word() {
	var count = 0
	const { cursor } = storeToRefs(EditorState())
	const { currFileLines } = storeToRefs(FilesStore())
	for (const letter of currFileLines.value[cursor.value.y].substring(cursor.value.x + 1)) {
		if (letter.match(/[a-zA-Z0-9]/)) {
			count += 1
		} else if (letter !== " ") {
			cursor.value.rset(count + 1, 0)
			count = 0
			break
		} else {
			cursor.value.rset(count + 2, 0)
			count = 0
			break
		}
	}
}
export function prev_word() {
	var count = 0
	const { cursor } = storeToRefs(EditorState())
	const { currFileLines } = storeToRefs(FilesStore())
	const line = currFileLines.value[cursor.value.y].substring(0, cursor.value.x)
	for (const letter of line.split('').reverse().join('')) {
		if (letter.match(/[a-zA-Z0-9]/)) {
			count += 1
		}
		else if (letter !== " ") {
			cursor.value.rset(-count, 0)
			count = 0
			break
		}
		else {
			cursor.value.rset(-count - 2, 0)
			count = 0
			break
		}
	}
}
