import { storeToRefs } from "pinia"
import { EditorState, VimState } from "../../../state"
import { ref } from "vue"
import { VimModes } from "../vim"
import { toggle } from "../global"

const commands = new Map<string, Function>()
commands.set("Explore", toggle)
const command_list = Array.from(commands.keys())
export const ref_command_list = ref(command_list)

export function commandRunner(key: string) {
	const store = VimState()
	const { command } = storeToRefs(store)
	switch (key) {
		case "Escape":
			store.change_vim_mode(VimModes.Normal)
			command.value = ""
			ref_command_list.value = command_list
			break
		case "Backspace": {
			command.value = command.value.slice(0, -1)
			break
		}

		case "Enter":
			store.change_vim_mode(VimModes.Normal)
			ref_command_list.value = command_list
			const c = commands.get(command.value)
			if (c !== undefined) {
				c()
			}
			else if (command.value.match(/(\d)+/)) {
				const { cursor } = storeToRefs(EditorState())
				cursor.value.set(0, Number(command.value) - 1)
			}

			command.value = ""
			break

		default:
			if (key.length === 1) {
				command.value += key
				//TODO replace with a better sort function
				ref_command_list.value = []
				for (const cmd of command_list) {
					if (cmd.toLowerCase().match(command.value)) {
						ref_command_list.value.push(cmd)
					}
				}
			}
			break
	}
}
