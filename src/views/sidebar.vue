<template>
	<div class="sidebar" id="sidebar" tabindex="0"
		v-show="show_sidebar">
		<div class="tools">
			<label class="curr_dir">{{ current_dir }}/</label>
			<img @click="open_file_picker" class="open_dir" src="/svgs/folder-open.svg">
		</div>
		<hr>
		<Fileview class="fileview" v-if="cwd" :files="cwd"></Fileview>
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

const { show_sidebar} = storeToRefs(GlobalStore())

const current_dir = ref<string>("")
const cwd = ref()

async function open_file_picker(): Promise<void> {
	const selected = await open({ directory: true })
	if (Array.isArray(selected)) {
		console.warn("not supported")
	} else if (selected !== null) {
		current_dir.value = selected
		cwd.value = await ListDirs(selected)
	}
}


onMounted(async () => {
	const response = await invoke<{ active_dir: string, files: string[] }>("load_prev_state")
	if (response.active_dir) {
		current_dir.value = response.active_dir
		cwd.value = await ListDirs(response.active_dir)
		for (const file of response.files) {
			OpenFile(file)
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

	&:focus {
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

.fileview {
	margin: 4px;
	margin-left: 0;
}
</style>
