<template>
	<button @click="open_file">Open File</button>
	<div>
		<Line :text="line" v-for="line in lines" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Line from '../components/line.vue';
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';

const lines = ref<string[]>([])

async function load(file: string) {

	lines.value = []

	await invoke("open_file", {filepath: file})

	console.log(file)

	lines.value = await invoke<string[]>("file_lines", { fileIndex: 0, startPos: 0, endPos: 100 })

	console.log(lines.value)
}

onMounted(async () => {
})

async function open_file() {
	const selected = await open({})
	if (Array.isArray(selected)) {
		console.log("not supported")
	} else if (selected !== null) {
		load(selected)
	}
}

// onkeydown = (event) => {
// }
</script>

<style scoped>
div {
	display: flex;
	flex-direction: column;
}
</style>
