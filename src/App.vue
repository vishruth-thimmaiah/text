<template>
	<Topbar />
	<div class="wksp">
		<Sidebar />
		<Editor />
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
		"sidebar editor" min-content
		"sidebar editor" 1fr
		/ min-content 1fr;
}

.sidebar {
	grid-area: sidebar;
	resize: horizontal;
	overflow: auto;
	min-width: 30vw;
	max-width: 50vw;
}

.editor {
	grid-area: editor;
	min-width: 0;
}
</style>
