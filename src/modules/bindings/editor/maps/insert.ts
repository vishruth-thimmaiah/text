import * as binds from "../file"

export function insertEditor(key: string) {

	if (key.length === 1) {
		binds.insert_char(key)

	}

	else if (key === "Enter") {
		binds.newline()
	}

	else if (key === "Backspace") {
		binds.remove_char()
	}

	else if (key === "Escape") {
		binds.save_file()
	}
}
