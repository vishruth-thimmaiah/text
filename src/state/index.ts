import { defineStore } from "pinia";
import { ref } from "vue";
import { VimModes } from "../bindings/vim";
import { Cursor } from '../ts/cursor.ts'

export const GlobalStore = defineStore('store', () => {
	const editor_top_height = ref<number>(0)
	const editor_down_height = ref<number>(0)
	const tabs = ref<string[]>([])
	const show_sidebar = ref<boolean>(true)
	const focus_on = ref<number>(1)

	return { editor_top_height, editor_down_height, tabs, show_sidebar, focus_on }
})

export const VimState = defineStore('vim', () => {
	const vim_mode = ref<VimModes>(VimModes.Normal)
	const command = ref<string>("")

	function change_vim_mode(mode: VimModes) {
		vim_mode.value = mode
	}

	return { vim_mode, change_vim_mode, command}
})

export const EditorState = defineStore('editor', () => {
	const active_tab = ref<number | null>(null)
	const lines = ref<string[]>([])
	const cursor = ref<Cursor>(new Cursor(0, 0))

	return { active_tab, lines, cursor }
})
