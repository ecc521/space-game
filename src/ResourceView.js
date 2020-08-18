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
			if (obj.fuel) {
				let current = obj.fuel.current
				let max = obj.fuel.max
				let percentage = current/max

				let graphic = new PIXI.Graphics()
				let height = width/4

				if (!obj.fuel.elementDistribution) {
					obj.fuel.elementDistribution = [1] //Fuel distribution - decimal percentage that each element is of total fuel.
				}

				//renderWidths - width to render each element at in fuel breakdown.
				let renderWidths = []
				for (let i=0;i<obj.fuel.elementDistribution.length;i++) {
					let current = obj.fuel.elementDistribution[i]
					if (i) {
						current += renderWidths[i - 1]
					}
					if (current > 1.0001) {throw "Sum of obj.fuel.elementDistribution should not be greater than 1. "}
					renderWidths.push(current)
				}

				console.log(renderWidths)
				//Draw rectangles for each element, overlapping, to show a distribution of per element power
				let elementColors = [0xBB00FF, 0x2991DB, 0xd4b22c, 0xde7147, 0x6d4ade, 0x696cbc]
				for (let i=renderWidths.length - 1;i>=0;i--) {
					graphic.beginFill(elementColors[i])
					let renderPercentage = percentage * renderWidths[i]
					graphic.drawRoundedRect(width * (1-renderPercentage), verticalOffset, width * renderPercentage, height, height/4)
					graphic.endFill()

				}

				console.log(graphic)


				//We'll add text showing the remaining fuel. If above 50%, show in tank, else to left.
				let text = new PIXI.Text(current, {
					font: width/3 + "px Arial",
					fill: "white"
				});

				text.y = verticalOffset + graphic.height / 2
				text.anchor.y = 0.5

				if (percentage > 0.5) {
					text.x = width - text.width - graphic.width / 3
				}
				else {
					text.x = width - graphic.width - text.width - width / 20 // width/20 for spacing.
				}

				//Draw bounding box. Do this AFTER text added to avoid messing with width calculations.
				graphic.beginFill(0xFFFFFF, 0.2)
				graphic.drawRoundedRect(0, verticalOffset, width, height, height/4)
				graphic.endFill()

				this.container.addChild(graphic)
				this.container.addChild(text)
				verticalOffset += height
			}
			if (obj.battery) {
				let current = obj.battery[0]
				let max = obj.battery[1]
				let percentage = current/max

				let batteryIcon = new PIXI.Sprite(resources.battery.texture)
				batteryIcon.y = verticalOffset
				let downsize = batteryIcon.width / width
				batteryIcon.width /= downsize
				batteryIcon.height /= downsize
				batteryIcon.height /= 1.8 //The battery is a bit tall. Shrink it.

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
	elements: [400, 250, 133, 112, 76, 22],
	fuel: {
		current: 100,
		max: 200,
		elementDistribution: [0.6, 0.2, 0.1, 0.05, 0.03, 0.02]
	}
})
*/
