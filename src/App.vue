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
	display: flex;
	margin: 30px 0px;
}
</style>
