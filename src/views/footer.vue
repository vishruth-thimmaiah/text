<template>
	<div class="footer">
			<img @click="show_sidebar = !show_sidebar" src="/svgs/sidebar.svg">
		<label> {{ vim_mode.toUpperCase() }} </label>
		<label id="keystrokes"></label>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { GlobalStore, VimState } from '../state';

const { vim_mode } = storeToRefs(VimState())
const { show_sidebar } = storeToRefs(GlobalStore())
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
	background: #181818;
	display: flex;
	z-index: 10;
	font-size: 12px;
	align-items: center;
}

#keystrokes {
	margin-left: auto;
	margin-right: 10px;
}
</style>
