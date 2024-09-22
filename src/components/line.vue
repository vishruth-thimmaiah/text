<template>
	<span :class="(cursor.y) === lineNumber ? 'line active' : 'line'" data-diag="" :data-linenumber="cursor.y !== lineNumber ?
		Math.abs(lineNumber! - cursor.y) : lineNumber! + 1">
		<span v-if="tokens" v-for="token in tokens" :class="token.tokenType">{{ line?.substring(token.start, token.start
			+ token.length) }}</span>
		<span v-if="tokens">{{ line?.substring(tokens?.slice(-1)[0].start! + tokens?.slice(-1)[0].length!) }}</span>
		<span v-else>{{ line }}</span>
	</span>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EditorState } from '../state';
import { Token } from '../modules/files/filedata';

defineProps<{
	line?: string,
	tokens?: Token[],
	lineNumber: number
}>()

const { cursor } = storeToRefs(EditorState())
</script>

<style scoped>
.line {
	margin-left: 32px;
	white-space-collapse: break-spaces;

	&[data-diag='1'] {
		&::before {
			color: #f38ba8;
		}
	}
	&[data-diag='2'] {
		&::before {
			color: #cba6f7;
		}
	}
	&[data-diag='3'] {
		&::before {
			color: #f5c2e7;
		}
	}
	&[data-diag='4'] {
		&::before {
			color: #f5e0dc;
		}
	}

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
