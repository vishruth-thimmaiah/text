<template>
	<div class="topbar">
		<button @click="load(tab)" v-for="tab in tabs">{{ tab }}</button>
		<button @click="open_file">Open File</button>
	</div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { ref } from 'vue';
import { UseStore } from '../state';
import { storeToRefs } from 'pinia';

const { active_tab, lines } = storeToRefs(UseStore())

const tabs = ref<string[]>([])

async function load(file: string) {

	lines.value = []

	await invoke("open_file", { filepath: file })

	active_tab.value = tabs.value.indexOf(file)
	lines.value = await invoke<string[]>("file_lines", { fileIndex: active_tab.value, startPos: 0, endPos: 100 })
}

async function open_file() {
	const selected = await open({})
	if (Array.isArray(selected)) {
		console.log("not supported")
	} else if (selected !== null) {
		tabs.value.push(selected)
		load(selected)
	}
}
</script>

<style scoped>
.topbar {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	background: #181818;
}
</style>
