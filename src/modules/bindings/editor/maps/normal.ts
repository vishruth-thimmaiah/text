import * as motions from "../motions"
import { insert_mode } from "../../common"

export function normalEditor(keys: string): boolean {
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

		// case "ZZ":
		// 	layout.close_tab()
		// 	return
	}
	return false
}
