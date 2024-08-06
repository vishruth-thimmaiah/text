<template>
	<span>
		<span class="line_number">{{ lineNumber! + 1 + editor_top_height }}</span>
		<span>{{ text }}</span>
	</span>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { GlobalStore } from '../state';

defineProps({
	text: String,
	lineNumber: Number
})

const { editor_top_height } = storeToRefs(GlobalStore())

</script>

<style scoped>
span {
	display: inline-block;
	font-family: monospace;
	font-size: 12px;
	letter-spacing: 1px;
	text-wrap: nowrap;
	line-height: 18px;

	.line_number {
		width: 30px;
		padding-left: 2px;
		background-color: #222222;
		margin-right: 8px;
	}
}
</style>
