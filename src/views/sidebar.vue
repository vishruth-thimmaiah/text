<template>
	<div class="sidebar">
		<div class="tools">
			<label class="curr_dir">{{ current_dir }}</label>
			<button @click="open_dir" class="open_dir">+</button>
		</div>
		<div class="files">
			<button class="dir" v-for="dir in dirs"> {{ dir }}/</button>
			<button @click="open_file(file)" class="file" v-for="file in files"> {{ file }}</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore } from '../state';

const dirs = ref<string[]>()
const files = ref<string[]>()
const current_dir = ref<string>("")

const { tabs, editor_down_height } = storeToRefs(GlobalStore())
const { lines, active_tab } = storeToRefs(EditorState())


async function open_dir() {
	const selected = await open({ directory: true })
	if (Array.isArray(selected)) {
		console.warn("not supported")
	} else if (selected !== null) {
		current_dir.value = selected
		const children = await invoke<string[][]>("list_files", { dir: selected })
		files.value = children[0]
		dirs.value = children[1]
	}
}

async function open_file(file: string) {

	const height = document.getElementById("editor")!.getBoundingClientRect().height
	editor_down_height.value = Math.ceil(height / 18)

	const index = tabs.value.indexOf(file)
	if (index === -1) {
		await invoke("open_file", { filepath: current_dir.value + '/' + file })
		tabs.value.push(file)
		active_tab.value = tabs.value.length - 1
		lines.value = await invoke<string[]>("file_lines", { fileIndex: active_tab.value, startPos: 0, endPos: editor_down_height.value })
	}
	else {
		active_tab.value = index
		lines.value = await invoke<string[]>("file_lines", { fileIndex: index, startPos: 0, endPos: editor_down_height.value })
	}
}

</script>

<style scoped>
.sidebar {
	width: clamp(20rem, 20rem, 25%);
	background: #121212;
	position: fixed;
	top: 1.7em;
	bottom: 1.5em;
	z-index: 5;
}

.tools {
	display: flex;
	align-items: center;

	.curr_dir {}

	.open_dir {
		background: none;
		border: 0;
		color: white;
		margin-left: auto;
		font-size: 25px;
	}
}

.files {
	display: flex;
	flex-direction: column;

	.dir,
	.file {
		text-align: left;
		background: none;
		color: white;
		border: 0;
		margin: 0 5px;
		border-radius: 5px;
		transition: background 300ms;

		&:hover {
			background: #555555;
		}
	}
}
</style>
