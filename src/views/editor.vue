<template>
	<div>
		<Cursor id="cursor" />
		<div @click="move_cursor">
			<Line :text="line" v-for="line in lines" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, ref, Ref } from 'vue';
import Line from '../components/line.vue';
import { invoke } from '@tauri-apps/api';
import Cursor from '../components/cursor.vue';

const lines = inject<Ref<string[]>>("lines", ref([]))
var active_tab = inject<Ref<number>>("active_tab")

onkeydown = async (event) => {
	console.log(event.key)
	const cursor = document.getElementById("cursor")!
	const left_incr = (window.getComputedStyle(cursor)).left.match(/(\d)+/g)!
	const top_incr = (window.getComputedStyle(cursor)).top.match(/(\d)+/g)!
	if (event.key.length === 1) {

		const cursor_pos_column = Math.floor((Number(left_incr)) / 8)
		const cursor_pos_row = Math.floor((Number(top_incr) - 16) / 18)

		console.log(cursor_pos_row, "row")

		lines.value[cursor_pos_row] = lines.value[cursor_pos_row].substring(0, cursor_pos_column) + event.key + lines.value[cursor_pos_row].substring(cursor_pos_column)
		await invoke("add_chars", { fileIndex: active_tab?.value, chars: event.key, startLine: cursor_pos_row, startPoint: cursor_pos_column })

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

function move_cursor(event: MouseEvent) {
	const cursor = document.getElementById("cursor")!
	cursor.style.top = `${round(event.y - 20, 18)}px`
	cursor.style.left = `${round(event.x - 20, 8)}px`
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
	position: relative;
	/* 18px */
	top: 16px;
	/* 8px */
	left: 0px;
}
</style>
