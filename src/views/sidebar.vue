<template>
	<div :class="'sidebar' + (focus_on == 1 ? ' active' : '')" id="sidebar" tabindex="0" @focusin="focus_on = 1"
		v-show="show_sidebar">
		<div class="tools">
			<label class="curr_dir">{{ current_dir }}</label>
			<img @click="open_dir" class="open_dir" src="/svgs/folder-open.svg">
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

const { tabs, editor_down_height, show_sidebar, focus_on } = storeToRefs(GlobalStore())
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
img {
	width: 2ch;
}

.sidebar {
	background: #121212;
	z-index: 5;

	&.active {
		border-bottom: lightblue 1px solid;
	}
}

.tools {
	display: flex;
	align-items: center;
	margin: 5px;

	.curr_dir {
		text-wrap: nowrap;
		overflow-x: auto;
		margin-right: 5px;
	}

	.open_dir {
		margin-left: auto;
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
		user-select: none;

		&:hover {
			background: #555555;
		}
	}
}
</style>
