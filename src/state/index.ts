import { defineStore } from "pinia";
import { ref } from "vue";
import { VimModes } from "../modules/bindings/vim";
import { Cursor } from '../modules/cursor.ts'

export const GlobalStore = defineStore('store', () => {
	const editor_top_height = ref<number>(0)
	const editor_down_height = ref<number>(0)
	const tabs = ref<string[]>([])
	const show_sidebar = ref<boolean>(true)
	const show_terminal = ref<boolean>(true)

	return { editor_top_height, editor_down_height, tabs, show_sidebar, show_terminal }
})

export const VimState = defineStore('vim', () => {
	const vim_mode = ref<VimModes>(VimModes.Normal)
	const modifier = ref<{mod: string, opts: any} | null>(null)

	function change_vim_mode(mode: VimModes, opt?: {mod: string, opts: any}) {
		vim_mode.value = mode
		if (opt) {
			modifier.value = opt
		}
	}

	return { vim_mode, change_vim_mode, modifier }
})

export const EditorState = defineStore('editor', () => {
	const cursor = ref<Cursor>(new Cursor(0, 0))
	const hoverText = ref<string>()

	return { cursor, hoverText }
})
