<template>
	<span :class="(cursor.y) === lineNumber ? 'active' : ''">
		<span class="line_number"> {{
			cursor.y !== lineNumber ?
				Math.abs(lineNumber! - cursor.y) : lineNumber! + editor_top_height + 1
		}}
		</span>
		<span class="line">{{ text }}</span>
	</span>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore } from '../state';

defineProps({
	text: String,
	lineNumber: Number
})

const { editor_top_height } = storeToRefs(GlobalStore())
const { cursor } = storeToRefs(EditorState())

</script>

<style scoped>
span {
	display: inline-block;
	font-family: monospace;
	font-size: 12px;
	letter-spacing: 2px;
	text-wrap: nowrap;
	line-height: 18px;
	white-space-collapse: break-spaces;

	.line_number {
		position: absolute;
		width: 28px;
		padding: 0 2px;
		background-color: #222222;
		margin-right: 8px;
		cursor: default;

	}

	.line {
		margin-left: 40px;
	}

	&.active {
		background-color: #141414;

		.line {
			background-color: inherit;
		}

		.line_number {
			text-align: right;
			background-color: inherit;
		}
	}
}
</style>
