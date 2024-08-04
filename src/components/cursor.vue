<template>
	<div :class="vim_mode"></div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { UseStore } from '../state';

const {vim_mode} = storeToRefs(UseStore())
</script>

<style scoped>
div {
	width: 1ch;
	height: 2ch;
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
