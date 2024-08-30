import { storeToRefs } from "pinia"
import { FilesStore } from "../files/filedata"

var tokenTypes: string[] = []
var tokenModifiers: string[] = []

interface legend {
	tokenTypes: string[],
	tokenModifiers: string[]
}
export function setTokenTypes(legend: legend) {
	tokenTypes = legend.tokenTypes
	tokenModifiers = legend.tokenModifiers
}

export function setColorSpans(tokens: number[]) {
	var absLine = 0
	var prevLength = 0
	const { files, active_tab } = storeToRefs(FilesStore())
	for (let i = 0; i < tokens.length; i += 5) {
		const lineNumber = tokens[i]
		const startPos = tokens[i + 1]
		const length = tokens[i + 2]
		const tokenType = tokens[i + 3]
		// const tokenModifier = tokens[i + 4]

		lineNumber > 0 ? prevLength = 0 : null
		absLine += lineNumber
		const line = files.value[active_tab.value!].lines[absLine]

		var lastToken = line[line.length - 1].text

		if (prevLength !== startPos) {
			line.splice(line.length - 1, 0, { text: lastToken.substring(0, startPos - prevLength), token: "none" })
			lastToken = lastToken.substring(startPos - prevLength)

		}
		prevLength = length

		line.splice(line.length - 1, 0, { text: lastToken.substring(0, length), token: tokenTypes[tokenType] })
		line[line.length - 1].text = lastToken.substring(length)

	}

}
