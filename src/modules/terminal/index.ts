import { invoke } from "@tauri-apps/api"
import { FitAddon } from "@xterm/addon-fit"
import { Terminal } from "@xterm/xterm"
import { cycle_view } from "../bindings/global"
import { Panels } from "../bindings/vim"

var globalTerminal: Terminal
var resizeAddon: FitAddon

export function create_terminal(container: HTMLElement) {

	invoke("init_terminal")
	const terminal = new Terminal({
		fontFamily: "'JetBrainsMono Nerd Font Mono', monospace",
		fontSize: 13,
		theme: {
			background: "rgba(0, 0, 0, 0)",
		},
	})
	globalTerminal = terminal

	resizeAddon = new FitAddon()
	terminal.loadAddon(resizeAddon)

	terminal.open(container)
	resize()	
	new ResizeObserver(resize).observe(container)

	read_from_backend(terminal)
	write_to_backend(terminal)

}

async function read_from_backend(terminal: Terminal) {
	const data = await invoke<string>("read_from_term")
	terminal.write(data)

	read_from_backend(terminal)
}

function write_to_backend(terminal: Terminal) {

	var isctrlW = false
	terminal.onData(async function(data: string) {
		if (data === "w" && isctrlW) {
			cycle_view(Panels.Terminal)
			isctrlW = false
			return
		}
		else if (data === "") {
			isctrlW = true
			return
		}
		isctrlW = false
		await invoke("write_to_term", { data })
	})
}

function resize() {
	resizeAddon.fit()
	invoke("resize_term", { rows: globalTerminal.rows, cols: globalTerminal.cols })
}

export function focusTerminal() {
	globalTerminal.focus()
}
