import { storeToRefs } from "pinia"
import { FilesStore } from "../files/filedata"
import { semantic_tokens } from "./requests"
import { getCaretPos, setCaretPos } from "../cursor/insert"
import { nextTick } from "vue"

var tokenTypes: string[] = []
// var tokenModifiers: string[] = []

interface legend {
	tokenTypes: string[],
	tokenModifiers: string[]
}
export function setTokenTypes(legend: legend) {
	tokenTypes = legend.tokenTypes
	// tokenModifiers = legend.tokenModifiers
}

export function setSemTokens(tokens: number[], filename: string) {
	const [x, y] = getCaretPos()
	var absLine = 0
	var abspos = 0
	var prevLen = 0
	const { files } = storeToRefs(FilesStore())
	for (let i = 0; i < tokens.length; i += 5) {
		const line = tokens[i]
		const startCharacter = tokens[i + 1]
		const length = tokens[i + 2]
		const tokenType = tokens[i + 3]
		// const tokenModifier = tokens[i + 4]

		const filesRef = files.value.filter((file) => {
			return file.filename == filename
		})[0]

		if (line > 0) {
			abspos = 0
			prevLen = 0
		}
		absLine += line
		abspos += startCharacter

		if (filesRef.tokens[absLine] === undefined) {
			filesRef.tokens[absLine] = []
		}

		if (prevLen !== abspos) {
			filesRef.tokens[absLine].push({ start: prevLen, length: abspos - prevLen, tokenType: "none" })
		}
		prevLen = abspos + length

		filesRef.tokens[absLine].push({ start: abspos, length: length, tokenType: tokenTypes[tokenType] })

	}

	// fix cursor position after updating tokens.
	nextTick(() => {
		setCaretPos(x, y)
	})
}

// TODO: use delta to update tokens
export function updateSemTokens(filename: string) {
	const { files } = storeToRefs(FilesStore())

	const selectedFile = files.value.filter((value) => {
		return value.filename === filename
	})

	selectedFile[0].tokens = []

	semantic_tokens(filename)
}
