<template>
	<button @click="open_file">Open File</button>
	<Cursor id="cursor" />
	<div>
		<Line @click="mouse_click" :text="line" v-for="line in lines" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Line from '../components/line.vue';
import { event, invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import Cursor from '../components/cursor.vue';

const lines = ref<string[]>([])

async function load(file: string) {

	lines.value = []

	await invoke("open_file", { filepath: file })

	lines.value = await invoke<string[]>("file_lines", { fileIndex: 0, startPos: 0, endPos: 100 })
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


onkeydown = async (event) => {
	console.log(event.key)
	const cursor = document.getElementById("cursor")!
	const left_incr = (window.getComputedStyle(cursor)).left.match(/(\d)+/g)!
	const top_incr = (window.getComputedStyle(cursor)).top.match(/(\d)+/g)!
	if (event.key.length === 1) {

		const cursor_pos_column = Math.floor((Number(left_incr) - 6) / 8)
		const cursor_pos_row = Math.floor((Number(top_incr) - 34) / 18)

		console.log(cursor_pos_row)

		lines.value[cursor_pos_row] = lines.value[cursor_pos_row].substring(0, cursor_pos_column) + event.key + lines.value[cursor_pos_row].substring(cursor_pos_column)
		await invoke("add_chars", { chars: event.key, startLine: cursor_pos_row, startPoint: cursor_pos_column })

		cursor.style.left = `${Number(left_incr) + 8}px`
	}

	else {
		switch (event.key) {
			case "ArrowDown":
				cursor.style.top = `${Number(top_incr) + 18}px`
				break;
			case "ArrowUp":
				cursor.style.top = `${Number(top_incr) - 18}px`
				break;
			case "ArrowLeft":
				cursor.style.left = `${Number(left_incr) - 8}px`
				break;
			case "ArrowRight":
				cursor.style.left = `${Number(left_incr) + 8}px`
				break;

			default:
				break;
		}

	}
}

onclick = (event) => {
	const cursor = document.getElementById("cursor")!
	cursor.style.top = `${round(event.y, 18)}px`
	cursor.style.left = `${round(event.x, 8)}px`
}


function round(number: number, multiple: number) {
	const mod = number % multiple
	if (mod < (multiple / 2)) {
		return number - mod
	}
	else {
		return number + (multiple - mod)
	}
}
</script>

<style scoped>
div {
	display: flex;
	flex-direction: column;
}

#cursor {
	position: absolute;
	/* 18px */
	top: calc(34px + 0px);
	/* 8px */
	left: calc(6px + 0px);
}
</style>
