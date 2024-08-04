<template>
	<div>
		<Cursor id="cursor" />
		<div @click="move_cursor">
			<Line :text="line" v-for="line in lines" />
		</div>
	</div>
</template>

<script setup lang="ts">
import Line from '../components/line.vue';
import Cursor from '../components/cursor.vue';
import { storeToRefs } from 'pinia';
import { UseStore } from '../state';
import { vim_bindings } from '../bindings/vim';

const store = UseStore()
const { lines } = storeToRefs(store)


onkeydown = async (event) => {
	document.getElementById("keystrokes")!.textContent = event.key

	vim_bindings(event.key)

	// const cursor = document.getElementById("cursor")!
	// const left_incr = (window.getComputedStyle(cursor)).left.match(/(\d)+/g)!
	// const top_incr = (window.getComputedStyle(cursor)).top.match(/(\d)+/g)!
	// if (event.key.length === 1) {
	//
	// 	const cursor_pos_column = Math.floor((Number(left_incr)) / 8)
	// 	const cursor_pos_row = Math.floor((Number(top_incr) - 16) / 18)
	//
	// 	console.log(cursor_pos_row, "row")
	//
	// 	lines.value[cursor_pos_row] = lines.value[cursor_pos_row].substring(0, cursor_pos_column) + event.key + lines.value[cursor_pos_row].substring(cursor_pos_column)
	// 	await invoke("add_chars", { fileIndex: active_tab.value, chars: event.key, startLine: cursor_pos_row, startPoint: cursor_pos_column })
	//
	// 	cursor.style.left = `${Number(left_incr) + 8}px`
	// }
	//
	//
	// }
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
