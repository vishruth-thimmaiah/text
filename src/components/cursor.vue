<template>
	<div :style="`left: ${cursor.x}px; top: ${cursor.y}px`" :class="vim_mode"></div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { UseStore } from '../state';

const store = UseStore()
const { vim_mode, cursor } = storeToRefs(store)
</script>

<style scoped>
div {
	position: relative;
	width: 1ch;
	height: 2ch;
	z-index: 10;
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
