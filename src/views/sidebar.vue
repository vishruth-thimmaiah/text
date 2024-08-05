<template>
	<div class="sidebar">
		<div class="tools">
			<label class="curr_dir">{{ current_dir }}</label>
			<button @click="open_dir" class="open_dir">+</button>
		</div>
		<div v-for="dir in dirs"> {{ dir }}/</div>
		<div v-for="file in files"> {{ file }}</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';

const dirs = ref<string[]>()
const files = ref<string[]>()
const current_dir = ref<string>("")


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

	.curr_dir {}

	.open_dir {
		background: none;
		border: 0;
		color: white;
		margin-left: auto;
		font-size: 25px;
	}
}
</style>
