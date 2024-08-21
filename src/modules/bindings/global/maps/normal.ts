import { command_mode } from "../../common"

export function global(keys: string): boolean {

	switch (keys) {
		case "Controlww":
			//TODO
			return true
		case ":":
			command_mode()
			return true
	}

	return false
}
