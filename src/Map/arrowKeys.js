//The rate of key repeats may vary between devices. We'll make it constant.
let intervals = Array(4)
function toggleInterval(event, enable = true) {
	let movementFactor = 1/300
	let millisecondsPerMove = 16
	let x = movementFactor * this.container.width
	let y = movementFactor * this.container.height
	let position = 0

	switch (event.code) {
		case "KeyW":
		case "ArrowUp":
			x *= 0
			break;
		case "KeyS":
		case "ArrowDown":
			x *= 0
			y *= -1
			position = 1
			break;
		case "KeyA":
		case "ArrowLeft":
			y *= 0
			position = 2
			break;
		case "KeyD":
		case "ArrowRight":
			x *= -1
			y *= 0
			position = 3
			break;
	}

	if (enable === true) {
		if (!intervals[position]) {
			intervals[position] = setInterval((function() {
				this.translate(x, y)
				this.bound(1) //Bounce none.
			}).bind(this), millisecondsPerMove)
		}
	}
	else if (intervals[position]) {
		clearInterval(intervals[position])
		delete intervals[position]
	}
}

module.exports = toggleInterval
