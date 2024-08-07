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

	public set(x: number, y: number) {
		if (x >= 0 && y >= 0) {
			this.x = x
			this.y = y
		}
	}

	public async rset(x: number, y: number) {
		const window_props = storeToRefs(GlobalStore())
		const { lines, active_tab } = storeToRefs(EditorState())

		//Scroll Down
		if (y && (this.y + y) > window_props.editor_down_height.value - 2) {
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
		//Scroll Up
		else if (this.y + y < 0) {

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
		else if (this.x + x >= 0 && this.y + y >= 0) {
			this.x += x
			this.y += y
		}
	}
}
