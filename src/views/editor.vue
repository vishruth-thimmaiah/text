<template>
	<div @focusin="focus_on = 0" tabindex="0" @resize="height" id="editor"
		:class="`editor ${focus_on == 0 ? ' active' : ''}`" :style="`left: ${show_sidebar ? '' : '0'};`">
		<Cursor v-if="active_tab !== null" />
		<div @click="move_cursor" id="lines" class="lines">
			<Line :text="line" :line-number="index" v-for="(line, index) in lines" />
		</div>
	</div>
</template>

<script setup lang="ts">
import Line from '../components/line.vue';
import Cursor from '../components/cursor.vue';
import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore } from '../state';
import { Panels, vim_bindings } from '../modules/bindings/vim';
import { onMounted } from 'vue';

const store = EditorState()
const { lines, active_tab } = storeToRefs(store)
const { show_sidebar, editor_down_height, focus_on } = storeToRefs(GlobalStore())



function move_cursor(event: MouseEvent) {
	const element = document.getElementById("lines")
	const rect = element?.getBoundingClientRect()
	store.cursor.set(Math.floor((event.x - rect!.left - 39) / 9), Math.floor((event.y - rect!.top) / 18))
}

function height() {
	const height = document.getElementById("editor")!.getBoundingClientRect().height
	editor_down_height.value = Math.floor(height / 18)
}
onMounted(async () => {
	height()


	document.getElementById("editor")!.onkeydown = async (event) => {
		console.log(23)
		if (["Super", "Control", "Alt", "Shift"].includes(event.key)) {
			return
		}
		vim_bindings(Panels.Editor, event.key, event.ctrlKey, event.metaKey)

		event.preventDefault()
	}


})

</script>

<style scoped>
.editor {
	overflow-x: auto;
	overflow-y: hidden;

	.placeholder {
		display: none;
	}

	&.active {
		border-bottom: var(--accent_color) 1px solid;

		.placeholder {
			display: initial;
		}

		.lines::before {
			border-bottom: var(--accent_color) 1px solid;
		}
	}

	.lines {
		display: flex;
		flex-direction: column;
		top: 0;

		&::before {
			content: '';
			position: absolute;
			background-color: var(--editor_background_line_numbers);
			top: 0;
			bottom: 0;
			width: 32px;
		}
	}
}
</style>
