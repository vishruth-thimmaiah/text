<template>
	<div @mousedown.prevent class="footer">
		<img @click="toggle_sidebar" src="/svgs/sidebar.svg">
		<img @click="toggle_terminal" src="/svgs/terminal.svg">
		<label> {{ vim_mode.toUpperCase() }} </label>
		<label id="lspProgress"> </label>
		<label id="keystrokes"></label>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { VimState } from '../state';
import { toggle_sidebar, toggle_terminal } from '../modules/bindings/global';

const { vim_mode } = storeToRefs(VimState())
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
	text-wrap: nowrap;
}

#keystrokes {
	margin-left: auto;
	margin-right: 10px;
}
</style>
