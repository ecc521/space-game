class Map {
	constructor(config = {}) {
		if (!config.width) {throw "config.width must be a positive number"}
		if (!config.height) {throw "config.height must be a positive number"}

		this.width = config.width
		this.height = config.height

		this.container = new PIXI.Container()
		this.container.zIndex = -1
		console.log(this.container)

		this.backgroundOptions = config.backgroundOptions

		//Bounds in which map will be displayed
		this.bounds = {
			xmin: app.renderer.width/app.renderer.resolution,
			xmax: 0,
			ymin: app.renderer.height/app.renderer.resolution,
			ymax: 0,
		}

		Object.assign(this.bounds, config.bounds || {})


		this.container.x = 0
		this.container.y = 0

		if (config.backgroundOptions) {
			this.background = new PIXI.Sprite(resources[this.backgroundOptions[Math.floor(Math.random() * this.backgroundOptions.length)]].texture)
			this.background.width = this.width
			this.background.height = this.height
			this.container.addChild(this.background)
			this.container.zIndex = -1
		}

		//Make map draggable
		this.container.interactive = true

		let translate = (function translate(x, y) {
			this.container.x = this.container.x + x;
			this.container.y = this.container.y + y;
		}).bind(this)

		let scale = 1
		let zoom = (function zoom(factorChange = 0, centerX = 0, centerY = 0, noFactorAdjustment = false) {
			//Note: centerX and centerY are page coordinates. They are not adjusted to container position on stage.
			//Also, we do not call bound() here to avoid double calls.

			if (!noFactorAdjustment) {
				//Adjust factorChange to make scaling exponential.
				//Note: This is faster at backing out than moving in. A factorChange of 0.5 (never happens) would result in 50% zoom in, 100% zoom out.
				//We may want to fix this, although rapidly zooming out is probably more important than rapidly zooming in.
				factorChange = scale * factorChange
			}
			scale += factorChange

			//Determine the mouse pointer location in the map
			let relativeX = centerX - this.container.x
			let relativeY = centerY - this.container.y

			//Determine the location in the map relative to entire map
			let asPercentageX = relativeX / this.container.width
			let asPercentageY = relativeY / this.container.height

			//Scale map
			this.container.scale.set(scale)

			//Determine the new X coordinate in map using the relative location
			let newRelativeX = this.container.width * asPercentageX
			let newRelativeY = this.container.height * asPercentageY

			//Translate map by the difference in old coordinates under mouse and new coordinates under mouse.
			translate(relativeX - newRelativeX, relativeY - newRelativeY)
		}).bind(this)

		let bound = (function(bounceFactor = 1.5) {
			if (scale < 0) {
				//The user must've scrolled out *insanely* fast. Correct this before proceeding.
				zoom(-scale * 2, undefined, undefined, true)
				console.warn("Inverted negative scale. ")
			}

			let xDiff = -(this.bounds.xmax - this.bounds.xmin)
			let yDiff = -(this.bounds.ymax - this.bounds.ymin)

			let requiredScale = Math.max(xDiff/this.container.width, yDiff/this.container.height)

			//Zoom such that both axes can fit the screen.
			if (requiredScale > 1) {
				zoom(requiredScale - 1, undefined, undefined, true)
			}

			//Translate such that we will the entire screen.
			let newX = Math.min(this.bounds.xmax, this.container.x)
			let newY = Math.min(this.bounds.ymax, this.container.y)

			//Maximums must be within bounds.x/ymin of edges
			newX = Math.max(newX, -(this.container.width-this.bounds.xmin))
			newY = Math.max(newY, -(this.container.height-this.bounds.ymin))

			//If bounceFactor is 1, we will not bounce at all. bounceFactor dictates the 1/ratio correction we apply.
			//This can help the user know it is the edge of the map, without letting them go too far off it.
			translate((newX - this.container.x)/bounceFactor, (newY - this.container.y)/bounceFactor)
		}).bind(this)

		var isDragging = false,
		prevX, prevY;

		let isZooming = false

		function down(moveData) {
			var pos = moveData.data.global;
			prevX = pos.x; prevY = pos.y;
			isDragging = true;
			console.log(moveData)
			if (moveData.data.originalEvent?.touches?.length === 2) {
			    isZooming = true;
			}
		}

		this.container.on("mousedown", down);
		this.container.on("touchstart", down)

		let previousDist;
		let startXAvg;
		let startYAvg;

		function pinchMove(e) {
			var dist = Math.hypot(
			    e.data.originalEvent.touches[0].pageX - e.data.originalEvent.touches[1].pageX,
			    e.data.originalEvent.touches[0].pageY - e.data.originalEvent.touches[1].pageY);

			if (!startXAvg && !startYAvg) {
				startXAvg = (e.data.originalEvent.touches[0].pageX + e.data.originalEvent.touches[1].pageX)/2
				startYAvg = (e.data.originalEvent.touches[0].pageY + e.data.originalEvent.touches[1].pageY)/2
			}
			if (previousDist) {
				let zoomFactor = 1/700
				zoom((dist - previousDist) * zoomFactor, startXAvg, startYAvg)
			}
			previousDist = dist
		}

		function move(moveData) {
			if (!isDragging) {
				return;
			}
			var pos = moveData.data.global;
			var dx = pos.x - prevX;
			var dy = pos.y - prevY;

			translate(dx, dy)

			prevX = pos.x; prevY = pos.y;

			if (isZooming) {
				pinchMove(moveData);
			}
			bound()
		}

		this.container.on("mousemove", move)
		this.container.on("touchmove", move)

		function end() {
			isDragging = false;
			isZooming = false;
			previousDist = null;
			startXAvg = null;
			startYAvg = null;
			bound(1)
		}

		//The rate of key repeats may vary between devices. We'll make it constant.
		let intervals = Array(4)
		let toggleInterval = (function toggleInterval(event, enable = true) {
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
					intervals[position] = setInterval(function() {
						translate(x, y)
						bound(1) //Bounce none.
					}, millisecondsPerMove)
				}
			}
			else if (intervals[position]) {
				clearInterval(intervals[position])
				delete intervals[position]
			}
		}).bind(this)

		document.addEventListener("keydown", toggleInterval)

		document.addEventListener("keyup", function(event) {
			toggleInterval(event, false)
		})

		this.container.on("mouseup", end)
		this.container.on("mouseout", end)
		this.container.on("touchend", end)

		this.container.on("wheel", console.log)

		document.body.addEventListener("wheel", (function(event){
		    event.preventDefault()
			zoom(event.deltaY * -0.001, event.pageX, event.pageY)
			bound()
		}).bind(this), {passive: false});


		this.items = config.items || []

		this.addItem = (function(item) {
			this.items.push(item)
		}).bind(this)

		this.removeItem = (function(item) {
			if (this.items.indexOf(item) === -1) {throw "Unable to find item"}
			this.items.splice(this.items.indexOf(item), 1)
		}).bind(this)

		this.onTick = (function() {
			this.items.forEach((item) => {
				if (item.setMap) {
					item.setMap(this)
				}
			})

			//Check every item in this map for item.onTick
			let callbacks = []
			this.items.forEach((item) => {
				if (item.onTick) {
					callbacks.push({
						priority: item.priority,
						onTick: item.onTick
					})
				}
			})

			callbacks.sort((b, a) => {
				return a.priority - b.priority
			})

			while (callbacks[0]) {
				//Every item can add additional callbacks when it's onTick is called.
				function addNewCallback(priority, onTick) {
					callbacks.push({
						priority, onTick
					})
				}
				callbacks.shift().onTick(addNewCallback)

				callbacks.sort((b, a) => {
					return a.priority - b.priority
				})
			}
		}).bind(this)

	}
}

module.exports = Map
