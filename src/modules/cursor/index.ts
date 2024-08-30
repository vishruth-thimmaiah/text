import { storeToRefs } from "pinia"
import { FilesStore, Line } from "../files/filedata"

export function setCaretPos(x: number, y: number) {

	const linesEl = document.getElementById("lines")!
	const selection = document.getSelection()

	if (linesEl.childNodes) {
		const range = createRange(linesEl.childNodes[y + 1] as HTMLElement, x)
		range.collapse(true)
		selection?.removeAllRanges()
		selection?.addRange(range)
	}
}


function createRange(node: Node, targetPosition: number) {
	let range = document.createRange();
	range.selectNode(node);

	let offset = 0;
	const stack = [node];
	while (stack.length > 0) {
		const current = stack.pop();

		if (current!.nodeType === Node.TEXT_NODE) {
			const len = current!.textContent!.length;
			if (offset + len >= targetPosition) {
				range.setStart(current!, targetPosition - offset);
				return range;
			}
			offset += len;
		} else if (current!.childNodes && current!.childNodes.length > 0) {
			for (let i = current!.childNodes.length - 1; i >= 0; i--) {
				stack.push(current!.childNodes[i]);
			}
		}
	}

	range.setStart(node, node.childNodes.length);
	return range;
};

export function getCaretPos(): [number, number] {
	const linesEl = document.getElementById("lines")!
	const selection = document.getSelection()
	const range = selection?.getRangeAt(0)

	const curr_block = range?.startContainer.parentElement!
	const curr_line = curr_block.parentElement!

	return [childLen(curr_line, curr_block) + range?.startOffset!, childPos(linesEl, curr_line!) - 1]
}

function childPos(parent: Element, child: Element): number {
	for (let i = 1; i < parent.childNodes.length; i++) {
		if (child.isSameNode(parent.childNodes[i])) {
			return i
		}
	}
	return 0
}

function childLen(parent: Element, child: Element): number {
	var offset = 0

	for (let elem of parent.children) {
		if (elem.isSameNode(child)) {
			return offset
		}
		offset += elem.textContent!.length
	}
	return 0
}

export function getFullLine(line: Line[]): string {
	var fullLine = ""

	for (let node of line) {
		fullLine += node.text
	}

	return fullLine
}

function getBreak(split: number, line: Line[]): [string, string] {
	var foundSplit = false
	var lineLength = 0
	var startLine = ""
	var resLine = ""

	for (let node of line) {
		if (foundSplit) {
			resLine += node.text
		}
		else {
			lineLength += node.text.length

			if (lineLength >= split) {
				resLine += node.text.substring(lineLength - split)
				startLine += node.text.substring(0, lineLength - split)
				foundSplit = true
				continue
			}

			startLine += node.text

		}
	}
	return [startLine, resLine]
}

export function newLine() {
	const { currFileLines } = storeToRefs(FilesStore())

	const [x, y] = getCaretPos()

	const currLine = currFileLines.value[y]

	const breakPoint = getBreak(x, currLine)
	currFileLines.value.splice(y, 1, [{ token: "none", text: breakPoint[0] }], [{ token: "none", text: breakPoint[1] }])

	setCaretPos(0, y + 1)
}

export function removeLine() {
	const [x, y] = getCaretPos()

	if (x !== 0 || y - 1 < 0) {
		return false
	}
	const { currFileLines } = storeToRefs(FilesStore())
	const fullLine = getFullLine(currFileLines.value[y])
	const prevLine = getFullLine(currFileLines.value[y - 1])

	setCaretPos(prevLine.length, y - 1)

	currFileLines.value[y - 1].splice(currFileLines.value[y - 1].length, 0, { token: "none", text: fullLine })
	currFileLines.value.splice(y, 1)
	return true
}
