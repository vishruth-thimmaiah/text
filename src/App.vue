<template>
	<Topbar />
	<Editor class="editor" />
	<Footer />
</template>

<script setup lang="ts">
import Editor from './views/editor.vue';
import Topbar from './views/topbar.vue';
import Footer from './views/footer.vue';
</script>

<style scoped>
.editor {
	margin: 20px;
}
</style>
