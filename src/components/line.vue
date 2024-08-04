<template>
	<label>{{ text }}</label>
</template>

<script setup lang="ts">
defineProps({
	text: String 
})

</script>

<style scoped>
label {
	font-family: monospace;
	font-size: 12px;
	letter-spacing: 1px;
	text-wrap: nowrap;
	line-height: 18px;
}
</style>
