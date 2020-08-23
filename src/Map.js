class Map {
	constructor(config = {}) {
		if (!config.width) {throw "config.width must be a positive number"}
		if (!config.height) {throw "config.height must be a positive number"}

		this.width = config.width
		this.height = config.height

		this.container = new PIXI.Container()

		this.backgroundOptions = config.backgroundOptions

		this.bounds = {
			xmin: -this.width + app.renderer.width/app.renderer.resolution,
			xmax: 0,
			ymin: -this.height + app.renderer.height/app.renderer.resolution,
			ymax: 0,
		}
		Object.assign(this.bounds, config.bounds || {})
		Object.assign(this.bounds, {
			startx: (this.bounds.xmin + this.bounds.xmax)/2,
			starty: (this.bounds.ymin + this.bounds.ymax)/2
		})
		Object.assign(this.bounds, config.bounds || {})

		this.container.x = this.bounds.startx
		this.container.y = this.bounds.starty

		if (config.backgroundOptions) {
			this.background = new PIXI.Sprite(resources[this.backgroundOptions[Math.floor(Math.random() * this.backgroundOptions.length)]].texture)
			this.background.width = this.width
			this.background.height = this.height
			this.container.addChild(this.background)
		}

		//Make map draggable
		this.container.interactive = true
		var isDragging = false,
		prevX, prevY;

		this.container.on("mousedown", function (moveData) {
			var pos = moveData.data.global;
			prevX = pos.x; prevY = pos.y;
			isDragging = true;
		});

		this.container.on("mousemove", (function (moveData) {
			if (!isDragging) {
				return;
			}
			var pos = moveData.data.global;
			var dx = pos.x - prevX;
			var dy = pos.y - prevY;

			//Drag and apply bounds. 
			this.container.x = Math.min(Math.max(this.container.x + dx, this.bounds.xmin), this.bounds.xmax);
			this.container.y = Math.min(Math.max(this.container.y + dy, this.bounds.ymin), this.bounds.ymax);;
			prevX = pos.x; prevY = pos.y;
		}).bind(this));

		this.container.on("mouseup", function (moveData) {
			isDragging = false;
		});


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
