<template>
	<div class="placeholder">
		<div id="cursor" :style="`left: calc(${cursor.x}ch + 33px); top: ${cursor.y * cursor_height}px`"
			:class="vim_mode">
			&nbsp;
			<div v-if="hoverText" class="hover">{{ hoverText }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EditorState, VimState } from '../state';
import { onMounted, ref } from 'vue';

const { cursor, hoverText } = storeToRefs(EditorState())
const { vim_mode } = storeToRefs(VimState())

const cursor_height = ref<number>(0)

onMounted(() => {
	cursor_height.value = document.getElementById("cursor")?.getBoundingClientRect().height!
})
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
	font-family: var(--editor-font-family);
	font-size: var(--editor-font-size);
	font-weight: var(--editor-font-weight);
	width: 1ch;
	z-index: 2;
	/* transition: all 50ms linear; */
	/* transition-property: left, top; */
	/* animation: blink 2s step-start 0s infinite; */
}

.normal {
	background: var(--cursor_normal);
}

.replace {
	border-bottom: 1px var(--cursor_replace) solid;
}

.hover {
	color: var(--editor_hover_foreground);
	background-color: var(--editor_hover_background);
	max-width: 400px;
	box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.12);
	border-radius: 6px;
	width: 40vw;
	max-height: 20vh;
	overflow-y: scroll;
	overflow-wrap: anywhere;
	white-space-collapse: break-spaces;
}

@keyframes blink {
	50% {
		opacity: 0.0;
	}
}
</style>
