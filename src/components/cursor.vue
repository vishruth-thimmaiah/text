<template>
	<div class="placeholder">
		<div id="cursor" :style="`left: calc(${cursor.x}ch + 33px); top: ${cursor.y * 19}px`" :class="vim_mode">
			&nbsp;
			<div v-if="hoverText" class="hover">{{ hoverText }}</div>
		</div>
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
	height: 0;
	width: 0;
}

#cursor {
	position: relative;
	font-family: monospace;
	font-size: 14px;
	width: 1ch;
	z-index: 2;
	/* transition: all 50ms linear; */
	/* transition-property: left, top; */
	/* animation: blink 2s step-start 0s infinite; */
}

.normal {
	background: var(--cursor_normal);
}

.insert {}

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
