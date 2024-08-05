export class Cursor {
	cursor: HTMLElement;
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.cursor = document.getElementById("cursor")!
		this.x = x
		this.y = y
	}

	public set(x: number, y: number) {
		if (x >= 0 && y >= 0) {
			this.x = x * 8
			this.y = y * 18
		}
	}

	public rset(x: number, y: number) {
		const newx = x * 8
		const newy = y * 18
		if (this.x + newx >= 0 && this.y + newy >= 0) {
			this.x += newx
			this.y += newy
		}
		console.log(this.x, this.y)
	}
}
