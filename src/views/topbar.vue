<template>
	<div class="topbar">
		<div :class="index === active_tab ? 'active' : ''" v-for="(tab, index) in tabs">
			<label @click="active_tab = index">{{ tab }}</label>
			<button @click="CloseFile(index)">×</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { GlobalStore } from '../state';
import { storeToRefs } from 'pinia';
import { FilesStore } from '../modules/files/filedata';
import { CloseFile } from '../modules/files/files';

const { active_tab } = storeToRefs(FilesStore())
const { tabs } = storeToRefs(GlobalStore())

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
