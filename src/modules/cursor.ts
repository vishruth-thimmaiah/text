import { storeToRefs } from "pinia";
import { EditorState, GlobalStore } from "../state";
import { invoke } from "@tauri-apps/api";

export class Cursor {
	protected cursor: HTMLElement;
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.cursor = document.getElementById("cursor")!
		this.x = x
		this.y = y
	}

	isValid(x: number, y: number): { valid: boolean, x?: number } {
		const { lines } = storeToRefs(EditorState())
		if (lines.value[y][x]) {
			return { valid: true }
		}
		var len = lines.value[y].length - 1
		len = len >= 0 ? len : 0
		return { valid: false, x: len }
	}

	public set(x: number, y: number) {
		const isValid = this.isValid(x, y)
		if (x >= 0 && y >= 0) {
			if (isValid.valid === true) {
				this.x = x
			} else {
				this.x = isValid.x!
			}

			this.y = y
		}
	}

	async scroll_down() {
		const window_props = storeToRefs(GlobalStore())
		const { lines, active_tab } = storeToRefs(EditorState())
		const line_number = window_props.editor_top_height.value + window_props.editor_down_height.value
		const line = await invoke<string[]>("file_lines", {
			fileIndex: active_tab.value, startPos: line_number, endPos: line_number + 1
		})
		if (line[0]) {
			lines.value.splice(0, 1)
			lines.value.push(line[0])
			window_props.editor_top_height.value += 1
		}
	}

	async scroll_up() {
		const window_props = storeToRefs(GlobalStore())
		const { lines, active_tab } = storeToRefs(EditorState())
		const line_number = window_props.editor_top_height.value - 1
		if (line_number >= 0) {
			const line = await invoke<string[]>("file_lines", {
				fileIndex: active_tab.value, startPos: line_number, endPos: line_number + 1
			})
			lines.value.splice(window_props.editor_down_height.value, 1)
			lines.value.splice(0, 0, line[0])
			window_props.editor_top_height.value -= 1
		}
	}

	public async rset(x: number, y: number) {
		const window_props = storeToRefs(GlobalStore())

		if ((this.y + y) > window_props.editor_down_height.value - 1) {
			await this.scroll_down()
		}
		else if (this.y + y < 0) {
			await this.scroll_up()
		}

		else if (this.x + x >= 0 && this.y + y >= 0) {
			this.x += x
			this.y += y
		}

		const isValid = this.isValid(this.x, this.y)
		if (isValid.valid !== true) {
			this.x = isValid.x!
		}
	}
}
