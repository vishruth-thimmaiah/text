<template>
	<span :class="(cursor.y) === lineNumber ? 'line active' : 'line'" :data-linenumber="cursor.y !== lineNumber ?
		Math.abs(lineNumber! - cursor.y) : lineNumber! + 1">
		<span v-for="token in line">{{ token }}</span>
	</span>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EditorState } from '../state';

defineProps<{
	line: string,
	lineNumber: number
}>()

const { cursor } = storeToRefs(EditorState())
</script>

<style scoped>
.line {
	margin-left: 32px;
	white-space-collapse: break-spaces;

	&::before {
		content: attr(data-linenumber);
		position: absolute;
		left: 0;
		width: 28px;
		padding: 0 2px;
		margin-right: 8px;
		cursor: default;
		user-select: none;
		-webkit-user-select: none;
	}

	&.active {
		background-color: var(--editor_background_line);

		&::before {
			text-align: right;
			background-color: inherit;
			color: var(--accent_color);
		}
	}
}
</style>
