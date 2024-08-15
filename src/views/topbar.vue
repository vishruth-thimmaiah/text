<template>
	<div class="topbar">
		<div :class="index === active_tab ? 'active' : ''" v-for="(tab, index) in tabs">
			<label @click="open_existing_file(index)">{{ tab }}</label>
			<button @click="close_file(index)">×</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api';
import { EditorState, GlobalStore } from '../state';
import { storeToRefs } from 'pinia';

const { active_tab, lines } = storeToRefs(EditorState())
const { tabs, editor_down_height } = storeToRefs(GlobalStore())

async function open_existing_file(index: number) {
	active_tab.value = index
	lines.value = await invoke<string[]>("file_lines", { fileIndex: index, startPos: 0, endPos: editor_down_height.value })
}

async function close_file(index: number) {
	tabs.value.splice(index, 1)
	if (active_tab.value === index) {
		active_tab.value -= 1
		await open_existing_file(active_tab.value)
	}
	else if (active_tab.value! >= index) {
		active_tab.value! -= 1
	}
	await invoke<string[]>("close_file", { fileIndex: index })
}

</script>

<style scoped>
.topbar {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	height: 2em;
	background-color: var(--topbar_background);
	color: var(--topbar_foreground);
	z-index: 10;
	display: flex;
	user-select: none;
	-webkit-user-select: none;

	div {
		background: var(--topbar_tabs);
		font-size: 14px;
		margin: 4px 2px;
		border-radius: 5px;
		padding: 0 5px;
		cursor: pointer;
		color: white;
		transition: background 700ms;

		label {
			cursor: inherit;
		}

		button {
			background: transparent;
			border: none;
			color: inherit;

			&:hover {
				color: lightgray;
			}
		}

		&:hover {
			background-color: var(--topbar_tabs_hover);
		}

		&.active {
			background-color: var(--topbar_tabs_active);
		}
	}
}
</style>
