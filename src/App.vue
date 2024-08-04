<template>
	<Topbar />
	<Editor class="editor" />
</template>

<script setup lang="ts">
import Editor from './views/editor.vue';
import Topbar from './views/topbar.vue';
</script>

<style scoped>
.editor {
	margin: 20px;
}
</style>
