import { defineStore } from "pinia";
import { ref } from "vue";
import { VimModes } from "../bindings/vim";
import { Cursor } from '../ts/cursor.ts'

export const GlobalStore = defineStore('store', () => {
	var editor_top_height = ref<number>(0)
	var editor_down_height = ref<number>(0)


	return { editor_top_height, editor_down_height }
})

export const VimState = defineStore('vim', () => {
	const vim_mode = ref<VimModes>(VimModes.Normal)

	function change_vim_mode(mode: VimModes) {
		vim_mode.value = mode
	}

	return { vim_mode, change_vim_mode }
})

export const EditorState = defineStore('editor', () => {
	const active_tab = ref<number>(0)
	const active_line = ref<number>(0)
	const lines = ref<string[]>([])
	const cursor = ref<Cursor>(new Cursor(40, 0))

	return { active_tab, lines, cursor, active_line }
})
