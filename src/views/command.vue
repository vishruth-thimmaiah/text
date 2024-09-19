<template>
	<div v-if="vim_mode === VimModes.Command" id="command">
		<div class="inp">
			<label v-if="modifier">{{modifier.mod}}</label>
			<input id="command-mode-input" v-model="command_input" @blur="closePalette" @keydown="keypress"
				placeholder="Run a Command">
		</div>
		<hr v-if="!modifier">
		<div v-if="!modifier" class="options">
			<div :class="'option' + (index === active_item ? ' active' : '')" v-for="(command, index) in command_list">
				{{ command }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { VimState } from '../state';
import { VimModes } from '../modules/bindings/vim';
import { get_command_list, run_command, run_custom_command, sort_cmd_pallete } from '../modules/bindings/commands/command';
import { ref, watch } from 'vue';

const vim_state = VimState()
const { vim_mode, modifier } = storeToRefs(vim_state)

const command_list = ref<string[]>(get_command_list())
const active_item = ref<number>(0)
const command_input = ref<string>("")

function keypress(event: KeyboardEvent) {
	if (
		event.key === "ArrowDown" ||
		(event.key === "j" && event.ctrlKey) ||
		(event.key === "n" && event.ctrlKey)) {
		if (active_item.value === command_list.value.length - 1) {
			active_item.value = 0
		} else {
			active_item.value += 1
		}
	}

	else if (event.key === "ArrowUp" ||
		(event.key === "k" && event.ctrlKey) ||
		(event.key === "p" && event.ctrlKey)) {
		if (active_item.value !== 0) {
			active_item.value -= 1
		} else {
			active_item.value = command_list.value.length - 1
		}
	}

	else if (event.key === "Escape") {
		closePalette()
	}

	else if (event.key === "Enter") {
		if (!modifier) {
			run_command(command_list.value[active_item.value])
		}
		else {
			run_custom_command(command_input.value, modifier.value!)
		}

		closePalette()
	}
}

function closePalette() {
	vim_state.change_vim_mode(VimModes.Normal)
	command_list.value = get_command_list()
	command_input.value = ""
	active_item.value = 0
	document.getElementById("editor")?.focus()
}

watch(command_input, (input) => {
	if (!modifier) {

	}
	command_list.value = sort_cmd_pallete(input)
	if (active_item.value >= command_list.value.length) {
		active_item.value = command_list.value.length - 1
	}
})

</script>

<style scoped>
#command {
	position: fixed;
	box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.25);
	top: 45px;
	right: 20px;
	width: 50vw;
	max-width: 700px;
	z-index: 20;
	color: var(--command_menu_foreground);
	border-radius: 6px;
	background-color: var(--command_menu_background);
	padding: 10px 0;

	.inp {
		display: flex;

		label {
			background: var(--command_menu_active_background);
			margin: 0 5px;
			padding: 0 5px;
			border-radius: 6px;
		}

		input {
			flex-grow: 1;
			padding-left: 5px;
			padding-bottom: 0;
			background: transparent;
			border: none;
			outline: none;
			color: white;
		}
	}

	.options {
		max-height: 40vh;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.option {
		background-color: var(--command_menu_background);
		list-style: none;
		margin: 0;
		padding: 5px;

		&.active {
			background: var(--command_menu_active_background);
			border-right: 3px solid var(--accent_color);
		}

	}
}
</style>
