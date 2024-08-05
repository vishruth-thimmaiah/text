<template>
	<div>
		<Cursor />
		<div @click="move_cursor" class="lines">
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
	store.cursor.set(Math.floor((event.x - 8) / 8), Math.floor((event.y - 30) / 18))
}

</script>

<style scoped>
div {
	position: relative;
	display: flex;
	flex-direction: column;
}

.lines {
	position: absolute;
}
</style>
