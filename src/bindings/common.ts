import { storeToRefs } from "pinia"
import { UseStore } from "../state"

export function move_right() {
	const { cursor } = storeToRefs(UseStore())
	cursor.value.rset(1, 0)
}
export function move_left() {
	const { cursor } = storeToRefs(UseStore())
	cursor.value.rset(-1, 0)
}
export function move_down() {
	const { cursor } = storeToRefs(UseStore())
	cursor.value.rset(0, 1)
}
export function move_up() {
	const { cursor } = storeToRefs(UseStore())
	cursor.value.rset(0, -1)
}
