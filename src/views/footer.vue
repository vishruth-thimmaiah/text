<template>
	<div @mousedown.prevent class="footer">
		<img @click="show_sidebar = !show_sidebar" src="/svgs/sidebar.svg">
		<img @click="show_terminal = !show_terminal" src="/svgs/terminal.svg">
		<label> {{ vim_mode.toUpperCase() }} </label>
		<label id="lspProgress"> </label>
		<label id="keystrokes"></label>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { GlobalStore, VimState } from '../state';

const { vim_mode } = storeToRefs(VimState())
const { show_sidebar, show_terminal } = storeToRefs(GlobalStore())
</script>

<style scoped>
img {
	width: 2ch;
	margin: 0 10px;
}

.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 2em;
	background-color: var(--footer_background);
	color: var(--footer_foreground);
	display: flex;
	z-index: 10;
	font-size: 12px;
	align-items: center;
	user-select: none;
	-webkit-user-select: none;
}

label {
	margin: 0 10px;
	max-width: 20ch;
	word-wrap: break-word;
}

#keystrokes {
	margin-left: auto;
	margin-right: 10px;
}
</style>
