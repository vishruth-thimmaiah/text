<template>
	<div tabindex="0" id="editor" class="editor">
		<Cursor v-if="active_tab !== null" />
		<div @click="move_cursor" id="lines" class="lines" :contenteditable="vim_mode === VimModes.Insert">
			<Line :tokens="files[active_tab].tokens[index]" :line="line" v-if="active_tab !== null && files[active_tab]"
				:line-number="index" v-for="(line, index) in files[active_tab].lines" />
		</div>
	</div>
</template>

<script setup lang="ts">
import Line from '../components/line.vue';
import Cursor from '../components/cursor.vue';
import { storeToRefs } from 'pinia';
import { EditorState, GlobalStore, VimState } from '../state';
import { Panels, vim_bindings, VimModes } from '../modules/bindings/vim';
import { nextTick, onMounted } from 'vue';
import { FilesStore } from '../modules/files/filedata';

const store = EditorState()
const filestore = FilesStore()
const { editor_top_height, editor_down_height } = storeToRefs(GlobalStore())
const { files, active_tab } = storeToRefs(FilesStore())
const { vim_mode } = storeToRefs(VimState())


function move_cursor(event: MouseEvent) {
	const element = document.getElementById("lines")
	const rect = element?.getBoundingClientRect()
	store.cursor.set(Math.floor((event.x - rect!.left - 33) / 8), Math.floor((event.y - rect!.top) / 18))
}

function height() {
	const height = document.getElementById("editor")!.getBoundingClientRect().height
	editor_down_height.value = Math.floor(height / 18)
}


onMounted(async () => {

	nextTick(() => {
		document.getElementById("editor")?.focus()
	})

	height()

	const editor = document.getElementById("editor")!

	editor.onkeydown = async (event) => {
		if (["Super", "Control", "Alt", "Shift"].includes(event.key)) {
			return
		}

		vim_bindings(Panels.Editor, event)

	}
	new ResizeObserver(height).observe(editor)

	editor.onscroll = () => {
		const topLine = Math.floor(editor.scrollTop / 18)
		editor_top_height.value = topLine

		const linesLoaded = files.value[active_tab.value!].lines_loaded

		if (editor_top_height.value + editor_down_height.value + 1 >= linesLoaded) {
			filestore.getLines(active_tab.value!, linesLoaded, linesLoaded + 50)
		}
	}
})

</script>
<style scoped>
.editor {
	overflow-x: auto;
	overflow-y: auto;
	color: var(--editor_foreground);
	background-color: var(--editor_background);

	&:focus {
		border-bottom: var(--accent_color) 1px solid;
	}

	&:focus-within {
		border-bottom: var(--accent_color) 1px solid;
	}

	.lines {
		position: relative;
		display: flex;
		flex-direction: column;
		top: 0;
		text-wrap: nowrap;
		font-family: var(--editor-font-family);
		font-size: var(--editor-font-size);
		font-weight: var(--editor-font-weight);

		&::before {
			content: '';
			position: absolute;
			background-color: var(--editor_background_line_numbers);
			top: 0;
			height: 100vh;
			width: 32px;
		}

		&:focus {
			outline: none;
		}
	}
}
</style>
