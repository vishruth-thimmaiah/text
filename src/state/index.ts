import { defineStore } from "pinia";
import { ref } from "vue";
import { VimModes } from "../bindings/vim";
import { Cursor } from '../ts/cursor.ts'

export const UseStore = defineStore('store', () => {
	const active_tab = ref<number>(0)
	const lines = ref<string[]>([])
	const vim_mode = ref<VimModes>(VimModes.Normal)
	const cursor = ref<Cursor>(new Cursor(0, 0))

	function change_vim_mode(mode: VimModes) {
		vim_mode.value = mode
	}

	return { active_tab, lines, vim_mode, change_vim_mode, cursor }
})
