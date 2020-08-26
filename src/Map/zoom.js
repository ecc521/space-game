function zoom(factorChange = 0, centerX = 0, centerY = 0, noFactorAdjustment = false) {
	//Note: centerX and centerY are page coordinates. They are not adjusted to container position on stage.
	//Also, we do not call bound() here to avoid double calls.

	if (!noFactorAdjustment) {
		//Adjust factorChange to make scaling exponential.
		//Note: This is faster at backing out than moving in. A factorChange of 0.5 (never happens) would result in 50% zoom in, 100% zoom out.
		//We may want to fix this, although rapidly zooming out is probably more important than rapidly zooming in.
		factorChange = this.scale * factorChange
	}
	this.scale += factorChange

	//Determine the mouse pointer location in the map
	let relativeX = centerX - this.container.x
	let relativeY = centerY - this.container.y

	//Determine the location in the map relative to entire map
	let asPercentageX = relativeX / this.container.width
	let asPercentageY = relativeY / this.container.height

	//Scale map
	this.container.scale.set(this.scale)

	//Determine the new X coordinate in map using the relative location
	let newRelativeX = this.container.width * asPercentageX
	let newRelativeY = this.container.height * asPercentageY

	//Translate map by the difference in old coordinates under mouse and new coordinates under mouse.
	this.translate(relativeX - newRelativeX, relativeY - newRelativeY)
}


module.exports = zoom
