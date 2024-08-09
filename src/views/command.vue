<template>
	<label v-if="vim_mode === VimModes.Command" id="command">:{{ command }}</label>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { VimState } from '../state';
import { VimModes } from '../bindings/vim';


const { vim_mode, command } = storeToRefs(VimState())
</script>

<style scoped>
label {
	align-content: center;
	position: fixed;
	height: 40px;
	width: 450px;
	top: 45px;
	right: 20px;
	z-index: 20;
	background-color: var(--command_menu_background);
	color: var(--command_menu_foreground);
	border: var(--accent_color) 2px solid;
	color: white;
	border-radius: 10px;
	font-size: 16px;
	font-family: monospace;
	padding: 5px;
}
</style>
