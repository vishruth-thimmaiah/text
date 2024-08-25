<template>
	<Topbar />
	<div class="wksp">
		<Sidebar />
		<Editor />
		<Terminal />
	</div>
	<Footer />
	<Command />
</template>

<script setup lang="ts">
import Editor from './views/editor.vue';
import Topbar from './views/topbar.vue';
import Footer from './views/footer.vue';
import Sidebar from './views/sidebar.vue';
import Command from './views/command.vue';
import { invoke } from '@tauri-apps/api';
import Terminal from './views/terminal.vue';

var root = document.querySelector(':root') as HTMLElement;
invoke<Object | null>("load_theme").then(function (res) {
	if (res) {
		const styles = new Map(Object.entries(res))
		for (const [key, val] of styles) {
			root.style.setProperty(`--${key}`, val)
		}
	}
})

invoke("start_lsp_server")
</script>

<style scoped>
.wksp {
	position: fixed;
	top: 2em;
	bottom: 1.5em;
	left: 0;
	right: 0;
	display: grid;
	grid-template:
		"sidebar editor" 2fr
		"sidebar terminal" 0fr
		/ min-content 1fr;
}

.sidebar {
	grid-area: sidebar;
	resize: horizontal;
	overflow: auto;
	min-width: 20vw;
	width: 30vw;
	max-width: 50vw;
}

.editor {
	grid-area: editor;
	min-width: 0;

	&:focus {
		outline: none;
	}

}

.terminal {
	grid-area: terminal;
	height: 30vh;
}
</style>
