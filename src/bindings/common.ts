
export function move_right(cursor: HTMLElement) {
	const left_incr = (window.getComputedStyle(cursor)).left.match(/(\d)+/g)!
	console.log(left_incr)
	cursor.style.left = `${Number(left_incr) + 8}px`
}
export function move_left(cursor: HTMLElement) {
	const left_incr = (window.getComputedStyle(cursor)).left.match(/(\d)+/g)![0]
	console.log(left_incr)
	cursor.style.left = `${Number(left_incr) - 8}px`
}
export function move_up(cursor: HTMLElement) {
	const top_incr = (window.getComputedStyle(cursor)).top.match(/(\d)+/g)!
	cursor.style.top = `${Number(top_incr) - 18}px`
}
export function move_down(cursor: HTMLElement) {
	const top_incr = (window.getComputedStyle(cursor)).top.match(/(\d)+/g)!
	cursor.style.top = `${Number(top_incr) + 18}px`
}
