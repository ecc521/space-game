class TechTree {
	constructor() {
		this.sprite = new PIXI.Sprite(resources.techtree.texture)
		this.sprite.interactive = true

		this.resize = (function() {
			this.sprite.width = Math.max(app.renderer.width / 10 / window.devicePixelRatio, 64)
			this.sprite.height = this.sprite.width

			this.sprite.anchor.x = 0
			this.sprite.anchor.y = 1

			this.sprite.x = 0
			this.sprite.y = app.renderer.height / window.devicePixelRatio
		}).bind(this)

		this.expandTechView = function() {
			console.log("TODO: Tech view")
		}

		this.sprite.on("click", this.expandTechView)
		this.sprite.on("tap", this.expandTechView)
	}
}

module.exports = TechTree
