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

	console.log(tokenModifiers, tokenTypes)
}

var absLine = 0
var abspos = 0
var lineLen = 0
export function setColorSpans(tokens: number[]) {
	const { files, active_tab } = storeToRefs(FilesStore())
	for (let i = 0; i < tokens.length; i += 5) {
		const line = tokens[i]
		const startCharacter = tokens[i + 1]
		const length = tokens[i + 2]
		const tokenType = tokens[i + 3]
		// const tokenModifier = tokens[i + 4]

		const lines = files.value[active_tab.value!].lines

		line > 0 ? abspos = 0 : null
		line > 0 ? lineLen = 0 : null
		absLine += line
		abspos += startCharacter
		const li = lines[absLine].slice(abspos, abspos + length)

		modifyEditor(li, absLine, abspos, length, tokenType)
	}
}

export function modifyEditor(content: string, linenumber: number, start: number, length: number, tokenType: number) {
	const editorLine = document.getElementById("lines")?.children[linenumber]

	const unformattedLine = editorLine?.lastElementChild!.lastElementChild!

	if (lineLen != start) {
		const test2 = unformattedLine.textContent?.slice(0, start - lineLen)!
		unformattedLine.textContent = unformattedLine.textContent?.slice(start - lineLen)!

		const test3 = document.createElement("span")
		test3.textContent = test2

		unformattedLine.insertAdjacentElement("beforebegin", test3)
	}

	unformattedLine.textContent = unformattedLine?.textContent?.slice(length) || ""
	lineLen = start + length


	const test = document.createElement("span")
	test.textContent = content
	test.className = tokenTypes[tokenType]

	unformattedLine.insertAdjacentElement("beforebegin", test)
}
// 0,0,2,6,0,   0,3,4,4,4,   1,4,7,7,16400,  0,7,1,7,0,    0,2,15,14,32768
