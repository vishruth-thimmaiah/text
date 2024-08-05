<template>
	<div class="editor">
		<Cursor />
		<div @click="move_cursor" id="lines" class="lines">
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

	event.preventDefault()

}

function move_cursor(event: MouseEvent) {
	const element = document.getElementById("lines")
	const rect = element?.getBoundingClientRect()
	store.cursor.set(Math.floor((event.x - rect!.left) / 8), Math.floor((event.y - rect!.top) / 18))
}

</script>

<style scoped>
.editor {
	position: absolute;
	left: 25%;
	right: 0;
	top: 1.2em;
	bottom: 1em;
	margin: 0.5em;
}

.lines {
	position: absolute;
	display: flex;
	flex-direction: column;
	top: 0;
}
</style>
