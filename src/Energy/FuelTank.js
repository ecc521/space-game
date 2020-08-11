//FuelTank stores the fuels available for the reactor.
const path = require("path")
const utils = require(path.join(__dirname, "../", "utils.js"))

let assets = utils.loadAssetJSON(__filename)

class FuelTank {
	constructor(config = {}) {
		this.capacity = config.capacity
	}

	static description = assets.description
	static levels = assets.levels

	static getDesignWeight(config = {}) {
		let levelData = FuelTank.levels[config.level - 1]

		if (levelData === undefined) {throw "Invalid config.level: " + config.level}

		let ratio = utils.relativeCost(config.capacity, levelData.capacity[0], levelData.capacity[1])
		let weight = levelData.weight[0] + (ratio * (levelData.weight[1] - levelData.weight[0]))

		return weight
	}
}

module.exports = FuelTank
