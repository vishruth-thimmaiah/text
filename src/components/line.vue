<template>
	<span :class="(cursor.y) === lineNumber ? 'active' : ''">
		<span class="line_number"> {{
			cursor.y !== lineNumber ?
				Math.abs(lineNumber! - cursor.y) : lineNumber! + 1
		}}
		</span>
		<span class="line">{{ text }}</span>
	</span>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EditorState } from '../state';

defineProps({
	text: String,
	lineNumber: Number
})

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
		margin-right: 8px;
		cursor: default;
		user-select: none;
		-webkit-user-select: none;
	}

	.line {
		margin-left: 40px;
	}

	&.active {
		background-color: var(--editor_background_line);

		.line {
			background-color: inherit;
		}

		.line_number {
			text-align: right;
			background-color: inherit;
			color: var(--accent_color);
		}
	}
}
</style>
