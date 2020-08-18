const utils = require("./utils.js")

class ResourceView {
	constructor() {
		this.container = new PIXI.Container()
		stage.addChild(this.container)

		this.render = (function(obj = {}) {
			this.container.removeChildren()
			let ratio = 8
			let width = app.renderer.width / app.renderer.resolution / ratio
			let verticalOffset = 0

			if (obj.credits !== undefined) {
				let creditsIcon = new PIXI.Sprite(resources.credits.texture)
				creditsIcon.width = width / 5
				creditsIcon.height = creditsIcon.width
				creditsIcon.x = width
				creditsIcon.anchor.x = 1
				console.log(creditsIcon)
				this.container.addChild(creditsIcon)

				let credits = new PIXI.Text(obj.credits, {
					font: width/3 + "px Arial",
					fill: "white"
				});
				credits.x = width - credits.width - creditsIcon.width - width / 20 // width/20 for spacing.
				credits.y = creditsIcon.y + creditsIcon.height / 2
				credits.anchor.y = 0.5
				console.log(credits)
				this.container.addChild(credits)
				verticalOffset += creditsIcon.height
			}
			if (obj.battery) {
				let batteryIcon = new PIXI.Sprite(resources.battery.texture)
				batteryIcon.y = verticalOffset
				let downsize = batteryIcon.width / width
				batteryIcon.width /= downsize
				batteryIcon.height /= downsize
				batteryIcon.height /= 1.8 //The battery is a bit tall. Shrink it.

				let current = obj.battery[0]
				let max = obj.battery[1]
				let percentage = current/max

				batteryIcon.width *= percentage
				batteryIcon.x = width - batteryIcon.width

				//We'll add text showing the remaining power. If battery is above 50%, show black in battery, else white to left.
				let text = new PIXI.Text(current, {
					font: width/3 + "px Arial",
					fill: "black"
				});

				text.y = verticalOffset + batteryIcon.height / 2
				text.anchor.y = 0.5

				if (percentage > 0.5) {
					text.x = width - text.width - batteryIcon.width / 3
				}
				else {
					text.style.fill = "white"
					text.x = width - batteryIcon.width - text.width - width / 20 // width/20 for spacing.
				}

				console.log(text)
				console.log(batteryIcon)
				this.container.addChild(batteryIcon)
				this.container.addChild(text)
				verticalOffset += batteryIcon.height
			}
			if (obj.fuel) {
				//TODO: Render fuel.
			}
			if (obj.elements) {

				let elementNames = utils.loadAssetJSON("Energy/Reactor.js").elementNames
				for (let i=0;i<obj.elements.length;i++) {
					let amount = obj.elements[i]
					let name = elementNames[i]
					let sprite = new PIXI.Sprite(resources[name.toLowerCase()].texture)
					sprite.width = width / 5
					sprite.height = sprite.width
					sprite.x = width
					sprite.anchor.x = 1
					sprite.y = verticalOffset

					let text = new PIXI.Text(amount, {
						font: width/3 + "px Arial",
						fill: "white"
					});
					text.y = verticalOffset + sprite.height / 2
					text.x = width - text.width - sprite.width - width / 20 // width/20 for spacing.
					text.anchor.y = 0.5


					this.container.addChild(sprite)
					this.container.addChild(text)
					console.log(sprite)
					console.log(text)

					verticalOffset += sprite.height
				}
			}

			this.container.x = width * (ratio - 1)
		}).bind(this)
	}
}

module.exports = ResourceView

/*
a = new ResourceView()
a.render({
	credits: 500,
	battery: [100, 150],
	elements: [400]
})
*/
