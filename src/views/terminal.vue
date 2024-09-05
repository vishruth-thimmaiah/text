<template>
	<div v-show="show_terminal" id="terminal" class="terminal">
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { GlobalStore } from '../state';
import { onMounted } from 'vue';
import { create_terminal } from '../modules/terminal';
const { show_terminal } = storeToRefs(GlobalStore())

onMounted(() => {
	create_terminal(document.getElementById("terminal")!)
})
</script>

<style scoped>
.terminal {
	background: var(--terminal_background);
	border-top: var(--footer_background) 1px solid;
}
</style>
