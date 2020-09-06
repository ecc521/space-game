const Map = require("./Map.js")

const Planet = require("./ObjectOfInterest/Planet.js")

class HomeSystem extends Map {
	constructor(config = {}) {
		super(config)

		for (let i=0;i<config.planets.length;i++) {
			let data = config.planets[i]
			console.log(data)
			let planet = new Planet(data)
			this.addItem(planet)

console.log(planet.sprite)
console.log(this.container)
			this.container.addChild(planet.sprite)
			this.container.addChild(planet.overlay)
		}
	}
}

module.exports = HomeSystem
