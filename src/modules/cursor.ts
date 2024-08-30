import { storeToRefs } from "pinia";
import { EditorState, GlobalStore } from "../state";
import { FilesStore } from "./files/filedata";
import { getFullLine } from "./cursor/index";

export class Cursor {
	protected cursor: HTMLElement;
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.cursor = document.getElementById("cursor")!
		this.x = x
		this.y = y
	}

	isValid(x: number, y: number): { newx: number, newy: number } {

		const { hoverText } = storeToRefs(EditorState())
		hoverText.value = ""
		const { currFileLines } = storeToRefs(FilesStore())

		var newx = x
		var newy = y

		if (currFileLines.value[y] === undefined) {
			newy = currFileLines.value.length - 1
		}
		
		const line = getFullLine(currFileLines.value[newy])
		if (line[x] === undefined) {
			newx = line.length - 1
		}

		return { newx, newy }
	}

	public set(x: number, y: number) {
		const isValid = this.isValid(x, y)
		if (x >= 0 && y >= 0) {
			this.x = isValid.newx
			this.y = isValid.newy
		}
	}

	scroll_down(y: number) {
		const filestore = FilesStore()
		const { files, active_tab } = storeToRefs(filestore)
		if (y >= files.value[active_tab.value!].lines_loaded) {
			filestore.getLines(active_tab.value!, y, y + 50)
		}
		document.getElementById("editor")?.scrollBy(0, 18)
	}
	scroll_up() {
		document.getElementById("editor")?.scrollBy(0, -18)
	}
	scroll_left() {
		document.getElementById("editor")?.scrollBy(-8, 0)
	}
	scroll_right() {
		document.getElementById("editor")?.scrollBy(8, 0)
	}

	public async rset(x: number, y: number) {

		const { editor_down_height, editor_top_height } = storeToRefs(GlobalStore())

		const newy = this.y + y
		const newx = this.x + x

		if (newy > editor_down_height.value + editor_top_height.value - 1) {
			this.scroll_down(newy)
		}
		else if (newy >= 0 && newy < editor_top_height.value) {
			this.scroll_up()
		}

		if (this.x + x >= 0 && this.y + y >= 0) {
			const isValid = this.isValid(newx, newy)
			this.x = isValid.newx
			this.y = isValid.newy
		}

	}
}
