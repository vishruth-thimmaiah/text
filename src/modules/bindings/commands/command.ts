import { toggle_sidebar, toggle_terminal } from "../global"

const commands = new Map<string, Function>()
commands.set("ui: Toggle Sidebar", toggle_sidebar)
commands.set("ui: Toggle Terminal", toggle_terminal)

export function get_command_list() {
	return Array.from(commands.keys())
}

export function run_command(input: string) {
	const command = commands.get(input)
	if (command) {
		command()
	}
}


export function sort_cmd_pallete(contents: string): string[] {

	const valid_queries = get_command_list().filter((val) => {
		if (val.toLowerCase().match(contents)) {
			return val
		}
	})

	return valid_queries
}
