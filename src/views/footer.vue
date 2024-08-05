<template>
	<div class="footer">
		<label> {{ vim_mode.toUpperCase() }} </label>
		<label id="keystrokes"></label>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { VimState } from '../state';

const { vim_mode } = storeToRefs(VimState())
</script>

<style scoped>
.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 1.5em;
	background: #181818;
	display: flex;
	padding: 0 10px;
	z-index: 10;
}

#keystrokes {
	margin-left: auto;
}
</style>
