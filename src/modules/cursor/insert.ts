import { storeToRefs } from "pinia"
import { FilesStore } from "../files/filedata"

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

export function getCaretPos(): [number, number] {
	const linesEl = document.getElementById("lines")!
	const selection = document.getSelection()
	const range = selection?.getRangeAt(0)

	if (range?.startContainer.parentElement?.parentElement?.className === "lines") {

		const curr_line = range?.startContainer.parentElement!
		const curr_block = curr_line.firstElementChild!

		return [childLen(curr_line, curr_block) + (range?.startOffset)!, childPos(linesEl, curr_line!)]
	}

	const curr_block = range?.startContainer.parentElement!
	const curr_line = curr_block.parentElement!

	return [childLen(curr_line, curr_block) + (range?.startOffset)!, childPos(linesEl, curr_line!)]

}

function childPos(parent: Element, child: Element): number {
	for (let i = 1; i < parent.childNodes.length; i++) {
		if (child.isSameNode(parent.childNodes[i])) {
			return i - 1
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


export function newLine() {
	const { currFileLines } = storeToRefs(FilesStore())

	const [x, y] = getCaretPos()

	const newLine = currFileLines.value[y].substring(x)

	currFileLines.value[y] = currFileLines.value[y].substring(0, x)
	currFileLines.value.splice(y + 1, 0, newLine)

	setCaretPos(0, y + 1)
}

export function removeLine() {
	const [x, y] = getCaretPos()

	if (x !== 0 || y - 1 < 0) {
		return false
	}
	const { currFileLines } = storeToRefs(FilesStore())

	const oldLine = currFileLines.value[y]


	currFileLines.value[y - 1] += oldLine
	currFileLines.value.splice(y, 1)

	setCaretPos(currFileLines.value[y - 1].length, y - 1)
	return true
}
