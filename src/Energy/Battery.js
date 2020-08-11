//Battery is the active power source. Any power needs come out of the battery. Power drains in excess of current battery capacity will need to wait on the reactor.
const path = require("path")
const utils = require(path.join(__dirname, "../", "utils.js"))

let assets = utils.loadAssetJSON(__filename)

class Battery {
	constructor(config = {}) {
		this.capacity = config.capacity

		this.charge = function(charge) {
			return new Promise((resolve, reject) => {
				onTick.push({
					priority: 100
				})
			})
		}
	}

	static description = assets.description
	static levels = assets.levels

	static getDesignWeight(config = {}) {
		let levelData = Battery.levels[config.level - 1]

		if (levelData === undefined) {throw "Invalid config.level: " + config.level}

		let ratio = utils.relativeCost(config.capacity, levelData.capacity[0], levelData.capacity[1])
		let weight = levelData.weight[0] + (ratio * (levelData.weight[1] - levelData.weight[0]))

		return weight
	}
}

module.exports = Battery
