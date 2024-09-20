<template>
	<div class="sidebar" id="sidebar" tabindex="0" v-show="show_sidebar">
		<label class="curr_dir">{{ current_dir }}/</label>
		<div class="tools">
			<img @click="open_file_picker" class="open_dir" src="/svgs/folder-open.svg">
			<label class="new_file" @click="command_mode('New File', {current_dir})">+</label>
		</div>
		<hr>
		<Fileview class="fileview" v-if="cwd" :files="cwd" :depth="0"></Fileview>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import { storeToRefs } from 'pinia';
import { GlobalStore } from '../state';
import { ListDirs, OpenFile, } from '../modules/files/files';
import Fileview from '../components/fileview.vue';
import { Panels, vim_bindings } from '../modules/bindings/vim';
import { initialize_lsp } from '../modules/lsp/requests';
import { command_mode } from '../modules/bindings/common';

const { show_sidebar } = storeToRefs(GlobalStore())

const current_dir = ref<string>("")
const cwd = ref()

async function open_file_picker(): Promise<void> {
	const selected = await open({ directory: true })
	if (Array.isArray(selected)) {
		console.warn("not supported")
	} else if (selected !== null) {
		current_dir.value = selected
		cwd.value = await ListDirs(selected)
		initialize_lsp(selected)
	}
}


onMounted(async () => {
	const response = await invoke<{ active_dir: string, files: string[] }>("load_prev_state")
	if (response.active_dir) {
		initialize_lsp(response.active_dir)
		current_dir.value = response.active_dir
		cwd.value = await ListDirs(response.active_dir)
		for (const file of response.files) {
			OpenFile(file)
		}
	}

	document.getElementById("sidebar")!.onkeydown = async (event) => {
		if (["Super", "Control", "Alt", "Shift"].includes(event.key)) {
			return
		}
		vim_bindings(Panels.Sidebar, event)

		event.preventDefault()
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

	&:focus-within {
		border-bottom: var(--accent_color) 1px solid;
		outline: none;
	}
}


.curr_dir {
	text-wrap: nowrap;
	overflow-x: auto;
	margin-right: 5px;
}

.tools {
	display: flex;
	align-items: center;
	margin: 5px;
	gap: 10px;

	.new_file {
		margin-left: auto;
	}
}

.fileview {
	margin: 4px;
	margin-left: 0;
}
</style>
