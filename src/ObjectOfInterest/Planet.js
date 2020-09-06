const ObjectOfInterest = require("./ObjectOfInterest.js")

class Planet extends ObjectOfInterest {
	constructor(config) {
		config.navigationTarget = true
		super(config)

		//Render planet.

		this.sprite = new PIXI.Sprite(resources[config.textureName].texture)
		//this.container.addChild(sprite)
		this.sprite.x = config.position[0]
		this.sprite.y = config.position[1]
		//As of now, we won't have any resizing with levels.
		this.sprite.height = config.size[0]
		this.sprite.width = config.size[0]
		this.sprite.zIndex = 5

		//Generate a translucent overlay for the background in a radius around the planet to improve contrast.
		console.time("GenerateOverlay")
		this.overlay = new PIXI.Graphics()
		this.overlay.beginFill(0x000000, 1/255)
		let max = this.sprite.width * 2
		while (max > this.sprite.width) {
			this.overlay.drawCircle(0, 0, max)
			max *= 0.993
		}
		console.log(this.overlay)
		this.overlay.cacheAsBitmap = true //If we don't do this, performance will be absolute junk. Overlays are currently smooth enough and fast enough to create,
		//that we don't have a problem caching, and don't need to attempt to reuse the same graphics. 
		this.overlay.x = this.sprite.x + this.overlay.width/4
		this.overlay.y = this.sprite.y + this.overlay.height/4
		console.timeEnd("GenerateOverlay")
	}
}

module.exports = Planet
