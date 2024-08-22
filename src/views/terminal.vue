<template>
	<div v-show="show_terminal" id="terminal" class="terminal">
	</div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { GlobalStore } from '../state';
const { show_terminal } = storeToRefs(GlobalStore())

const terminal = new Terminal({
	fontFamily: "'JetBrainsMono Nerd Font Mono', monospace",
	fontSize: 13,
	theme: {
		background: "rgba(0, 0, 0, 0)",
	},
})
const termFitAddon = new FitAddon()
terminal.loadAddon(termFitAddon)

async function read_from_term() {
	const data = await invoke<string>("read_from_term")
	terminal.write(data)

	read_from_term()
}

function resize() {
	termFitAddon.fit()
	invoke("resize_term", { rows: terminal.rows, cols: terminal.cols })
}

invoke("init_terminal")

onMounted(() => {
	const termDiv = document.getElementById("terminal")
	terminal.open(termDiv!)
	resize()

	terminal.onData(async function (data: string) {
		await invoke("write_to_term", { data })
	})

	new ResizeObserver(resize).observe(termDiv!)

	read_from_term()
})
</script>

<style scoped>
.terminal {
	background: var(--terminal_background);
	border-top: var(--footer_background) 1px solid;
}

</style>
