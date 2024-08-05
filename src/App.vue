<template>
	<Topbar />
	<div class="wksp">
		<Sidebar />
		<Editor />
	</div>
	<Footer />
</template>

<script setup lang="ts">
import Editor from './views/editor.vue';
import Topbar from './views/topbar.vue';
import Footer from './views/footer.vue';
import Sidebar from './views/sidebar.vue';
</script>

<style scoped>
.wksp {
	display: flex;
	margin: 30px 0px;
}
</style>
