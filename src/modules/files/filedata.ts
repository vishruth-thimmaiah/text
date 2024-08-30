import { invoke } from "@tauri-apps/api";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface Line {
	text: string;
	token: string
}

interface File {
	line_count: number;
	lines: Line[][];
	filename: string;
	lines_loaded: number;
}

export const FilesStore = defineStore("files", () => {
	const files = ref<File[]>([])
	const active_tab = ref<number | null>(null)

	const currFileLines = computed(function() {
		if (active_tab.value !== null) {
			return files.value[active_tab.value].lines
		}
		return []
	})

	async function newFile(filename: string) {
		const lineCount: number = await invoke("open_file", { filepath: filename })
		var file: File = {
			filename,
			line_count: lineCount,
			lines: new Array(lineCount).fill([]),
			lines_loaded: 0
		}
		files.value.push(file)

		active_tab.value = active_tab.value === null ? 0 : active_tab.value += 1

		return files.value.length - 1
	}

	async function getLines(index: number, start: number = 0, end: number = 50) {
		const lines = await invoke<string[]>("file_lines", {
			fileIndex: index,
			startPos: start,
			endPos: end
		})
		files.value[index].lines_loaded = end
		files.value[index].lines.splice(start, end, ...lines.map(line => ([{ text: line, token: "none" }])))
	}

	async function closeFile(index: number) {
		files.value.splice(index, 1)
		await invoke<string[]>("close_file", { fileIndex: index })
		if (active_tab.value === files.value.length) {
			active_tab.value -= 1
		}
	}

	return { files, active_tab, newFile, getLines, closeFile, currFileLines }
})


