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

		if (x >= 5 && y >= 0) {
			this.x = x * 8
			this.y = y * 18
		}
	}

	public async rset(x: number, y: number) {
		const window_props = storeToRefs(GlobalStore())
		const { lines, active_tab } = storeToRefs(EditorState())
		const newx = x * 8
		const newy = y * 18
		if (y && (this.y + newy) / 18 > window_props.editor_down_height.value - 2) {
			lines.value.splice(0, 1)
			const line_number = window_props.editor_top_height.value + window_props.editor_down_height.value
			const new_line = await invoke<string[]>("file_lines", {
				fileIndex: active_tab.value, startPos: line_number, endPos: line_number + 1
			})
			lines.value.push(new_line[0])
			window_props.editor_top_height.value += 1
		}
		else if (this.y + newy < 0) {

			const line_number = window_props.editor_top_height.value - 1
			if (line_number >= 0) {
				const new_line = await invoke<string[]>("file_lines", {
					fileIndex: active_tab.value, startPos: line_number, endPos: line_number + 1
				})
				lines.value.splice(window_props.editor_down_height.value, 1)
				lines.value.splice(0, 0, new_line[0])
				window_props.editor_top_height.value -= 1
			}
		}
		else if (this.x + newx >= 40 && this.y + newy >= 0) {
			this.x += newx
			this.y += newy
		}
	}
}
