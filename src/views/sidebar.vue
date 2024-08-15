<template>
	<div :class="'sidebar' + (focus_on == 1 ? ' active' : '')" id="sidebar" tabindex="0" @focusin="focus_on = 1"
		v-show="show_sidebar">
		<div class="tools">
			<label class="curr_dir">{{ current_dir }}</label>
			<img @click="open_dir()" class="open_dir" src="/svgs/folder-open.svg">
		</div>
		<hr>
		<div class="files">
			<button class="dir" v-for="dir in dirs"> {{ dir }}/</button>
			<button @click="open_file(current_dir + '/' + file)" class="file" v-for="file in files"> {{ file }}</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore } from '../state';

const dirs = ref<string[]>()
const files = ref<string[]>()
const current_dir = ref<string>("")

const { tabs, editor_down_height, show_sidebar, focus_on } = storeToRefs(GlobalStore())
const { lines, active_tab } = storeToRefs(EditorState())

async function open_file_picker(): Promise<string | undefined> {
	const selected = await open({ directory: true })
	if (Array.isArray(selected)) {
		console.warn("not supported")
	} else if (selected !== null) {
		return selected
	}
	return undefined
}


async function open_dir(dir?: string) {
	dir = dir || await open_file_picker()
	if (dir) {
		current_dir.value = dir
		const children = await invoke<string[][]>("list_files", { dir: dir })
		files.value = children[0]
		dirs.value = children[1]
	}
}

async function open_file(file: string) {

	const file_name = file.split('/').pop()!
	const index = tabs.value.indexOf(file_name)
	if (index === -1) {
		await invoke("open_file", { filepath: file })
		tabs.value.push(file_name)
		active_tab.value = tabs.value.length - 1
		lines.value = await invoke<string[]>("file_lines", { fileIndex: active_tab.value, startPos: 0, endPos: editor_down_height.value })
	}
	else {
		active_tab.value = index
		lines.value = await invoke<string[]>("file_lines", { fileIndex: index, startPos: 0, endPos: editor_down_height.value })
	}
}


onMounted(async () => {
	const response = await invoke<{ active_dir: string, files: string[] }>("load_prev_state")
	if (response.active_dir) {
		open_dir(response.active_dir)
		for (const file of response.files) {
			open_file(file)
		}
	}
})

</script>

<style scoped>
img {
	width: 2ch;
}

.sidebar {
	background-color: var(--sidebar_background);
	color: var(--sidebar_foreground);
	z-index: 5;

	&.active {
		border-bottom: var(--accent_color) 1px solid;
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
		-webkit-user-select: none;

		&:hover {
			background: var(--sidebar_file_background);
		}
	}
}
</style>
