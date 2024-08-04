import { defineStore } from "pinia";
import { ref } from "vue";

export const UseStore = defineStore('store', () => {
	const active_tab = ref<number>(0)
	const lines = ref<string[]>([])

	return { active_tab, lines }
})
