<template>
	<div @resize="height" id="editor" class="editor" :style="`left: ${show_sidebar ? '' : '0'};`">
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
import { EditorState, GlobalStore } from '../state';
import { vim_bindings } from '../bindings/vim';
import { onMounted } from 'vue';

const store = EditorState()
const { lines, active_tab } = storeToRefs(store)
const { show_sidebar, editor_down_height } = storeToRefs(GlobalStore())


onkeydown = async (event) => {
	document.getElementById("keystrokes")!.textContent = event.key
	vim_bindings(event.key)

	event.preventDefault()
}

function move_cursor(event: MouseEvent) {
	const element = document.getElementById("lines")
	const rect = element?.getBoundingClientRect()
	store.cursor.set(Math.floor((event.x - rect!.left - 39) / 9), Math.floor((event.y - rect!.top) / 18))
}

function height() {
	const height = document.getElementById("editor")!.getBoundingClientRect().height
	editor_down_height.value = Math.ceil(height / 18)
}
onMounted(() => {
	height()
})

</script>

<style scoped>
.editor {
	overflow-x: auto;
	overflow-y: hidden;
}

.lines {
	display: flex;
	flex-direction: column;
	top: 0;
}
</style>
