<template>
	<div id="terminal" class="terminal">
	</div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { onMounted } from 'vue';

const terminal = new Terminal({
	fontFamily: "'JetBrainsMono Nerd Font Mono', monospace",
	fontSize: 13,
	theme: {
		background: "rgb(47, 47, 47)",
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
	terminal.open(document.getElementById("terminal")!)
	resize()

	terminal.onData(async function (data: string) {
		await invoke("write_to_term", { data })
	})

	onresize = () => {
		resize()
	}

	read_from_term()
})
</script>

<style scoped>

.terminal {
	background: var(--sidebar_background);
}
</style>
