<template>
	<Topbar />
	<Editor class="editor"/>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';
import Editor from './views/editor.vue';
import Topbar from './views/topbar.vue';


const lines = ref<string[]>([])
var active_tab = ref<number>(0)
provide("lines", lines)
provide("active_tab", active_tab)
</script>

<style scoped>
.editor {
	margin: 20px;
}
</style>
