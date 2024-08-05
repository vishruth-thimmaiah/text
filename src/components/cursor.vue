<template>
	<div :style="`left: ${cursor.x}px; top: ${cursor.y}px`" :class="vim_mode"></div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EditorState, VimState } from '../state';

const store = EditorState()
const { cursor } = storeToRefs(store)
const vim = VimState()
const { vim_mode } = storeToRefs(vim)
</script>

<style scoped>
div {
	position: relative;
	width: 1ch;
	height: 2ch;
	z-index: 2;
	/* animation: blink 2s step-start 0s infinite; */
}

.normal {
	background: #ffffff88;
}

.insert {
	border-left: 1px white solid;
}

.replace {
	border-bottom: 1px white solid;
}

@keyframes blink {
	50% {
		opacity: 0.0;
	}
}
</style>
