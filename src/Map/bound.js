function bound(bounceFactor = 1.5) {
	if (this.scale < 0) {
		//The user must've scrolled out *insanely* fast. Correct this before proceeding.
		this.zoom(-this.scale * 2, undefined, undefined, true)
		console.warn("Inverted negative scale. ")
	}

	let xDiff = -(this.bounds.xmax - this.bounds.xmin)
	let yDiff = -(this.bounds.ymax - this.bounds.ymin)

	let requiredScale = Math.max(xDiff/this.container.width, yDiff/this.container.height)

	//Zoom such that both axes can fit the screen.
	if (requiredScale > 1) {
		this.zoom(requiredScale - 1, undefined, undefined, true)
	}

	//Translate such that we will the entire screen.
	let newX = Math.min(this.bounds.xmax, this.container.x)
	let newY = Math.min(this.bounds.ymax, this.container.y)

	//Maximums must be within bounds.x/ymin of edges
	newX = Math.max(newX, -(this.container.width-this.bounds.xmin))
	newY = Math.max(newY, -(this.container.height-this.bounds.ymin))

	//If bounceFactor is 1, we will not bounce at all. bounceFactor dictates the 1/ratio correction we apply.
	//This can help the user know it is the edge of the map, without letting them go too far off it.
	this.translate((newX - this.container.x)/bounceFactor, (newY - this.container.y)/bounceFactor)
}

module.exports = bound
