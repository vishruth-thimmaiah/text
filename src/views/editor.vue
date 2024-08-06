<template>
	<div id="editor" class="editor">
		<Cursor v-if="active_tab !== null" />
		<div @click="move_cursor" id="lines" class="lines">
			<Line :text="line" :line-number="index" v-for="(line, index) in lines" />
		</div>
	</div>
</template>

<script setup lang="ts">
import Line from '../components/line.vue';
import Cursor from '../components/cursor.vue';
import { storeToRefs } from 'pinia';
import { EditorState } from '../state';
import { vim_bindings } from '../bindings/vim';

const store = EditorState()
const { lines, cursor, active_tab } = storeToRefs(store)


onkeydown = async (event) => {
	document.getElementById("keystrokes")!.textContent = event.key
	vim_bindings(event.key)

	event.preventDefault()
}

function move_cursor(event: MouseEvent) {
	const element = document.getElementById("lines")
	const rect = element?.getBoundingClientRect()
	store.cursor.set(Math.floor((event.x - rect!.left) / 8), Math.floor((event.y - rect!.top) / 18))
}

onwheel = async (event) => {
	if (event.deltaY > 0) {
		cursor.value.rset(0, 1)
	}
	else {
		cursor.value.rset(0, -1)
	}
}

</script>

<style scoped>
.editor {
	position: absolute;
	left: clamp(20rem, 20rem, 25%);
	right: 0;
	top: 1.5em;
	bottom: 1em;
	margin: 0.5em;
	margin-left: 0;
	overflow-y: hidden;
}

.lines {
	position: absolute;
	display: flex;
	flex-direction: column;
	top: 0;
}
</style>
