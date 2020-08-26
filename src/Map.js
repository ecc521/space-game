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
		this.scale = 1

		this.translate = (function translate(x, y) {
			this.container.x = this.container.x + x;
			this.container.y = this.container.y + y;
		}).bind(this)

		this.zoom = require("./Map/zoom.js").bind(this)
		this.bound = require("./Map/bound.js").bind(this)

		var isDragging = false, prevX, prevY;

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

		let previousDist, startXAvg, startYAvg;

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
				this.zoom((dist - previousDist) * zoomFactor, startXAvg, startYAvg)
			}
			previousDist = dist
		}

		let move = (function move(moveData) {
			if (!isDragging) {
				return;
			}
			var pos = moveData.data.global;
			var dx = pos.x - prevX;
			var dy = pos.y - prevY;

			this.translate(dx, dy)

			prevX = pos.x; prevY = pos.y;

			if (isZooming) {
				pinchMove(moveData);
			}
			this.bound()
		}).bind(this)

		this.container.on("mousemove", move)
		this.container.on("touchmove", move)

		let end = (function end() {
			isDragging = false;
			isZooming = false;
			previousDist = null;
			startXAvg = null;
			startYAvg = null;
			this.bound(1)
		}).bind(this)

		this.container.on("mouseup", end)
		this.container.on("mouseout", end)
		this.container.on("touchend", end)

		//Allow arrow keys to move.
		const toggleInterval = require("./Map/arrowKeys.js").bind(this)
		document.addEventListener("keydown", toggleInterval)
		document.addEventListener("keyup", function(event) {
			toggleInterval(event, false)
		})

		//Allow wheel to zoom.
		document.body.addEventListener("wheel", (function(event){
		    event.preventDefault()
			this.zoom(event.deltaY * -0.001, event.pageX, event.pageY)
			this.bound()
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
