<template>
	<div id="cursor" :style="`left: calc(${cursor.x}ch + 40px); top: ${cursor.y * 2}ch`" :class="vim_mode">
		<div v-if="hoverText" class="hover">{{ hoverText }}</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EditorState, VimState } from '../state';

const { cursor, hoverText } = storeToRefs(EditorState())
const { vim_mode } = storeToRefs(VimState())
</script>

<style scoped>
.placeholder {
	position: relative;
	top: 0;
}

#cursor {
	position: relative;
	width: 1ch;
	height: 2ch;
	z-index: 2;
	/* transition: all 50ms linear; */
	/* transition-property: left, top; */
	/* animation: blink 2s step-start 0s infinite; */
}

.normal {
	background: var(--cursor_normal);
}

.insert {
	border-left: 1px var(--cursor_insert) solid;
}

.replace {
	border-bottom: 1px var(--cursor_replace) solid;
}

.hover {
	position: relative;
	background: var(--editor_background_line_numbers);
	max-width: 400px;
	border: var(--topbar_background) 1px solid;
	width: 40vw;
	max-height: 20vh;
	overflow-y: scroll;
	border-radius: 2px;
	top: 20px;
	left: 10px;
	overflow-wrap: anywhere;
	white-space-collapse: break-spaces;
}

@keyframes blink {
	50% {
		opacity: 0.0;
	}
}
</style>
