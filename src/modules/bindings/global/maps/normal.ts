import { cycle_view } from ".."
import { CloseFile } from "../../../files/files"
import { command_mode } from "../../common"
import { Panels } from "../../vim"

export function global(panel: Panels, keys: string): boolean {

	switch (keys) {
		case "Controlww":
			cycle_view(panel)
			return true
		case ":":
			command_mode()
			return true

		case "ZZ":
			CloseFile()
			return true
	}

	return false
}
