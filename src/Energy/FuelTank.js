//FuelTank stores the fuels available for the reactor.
const utils = require("../utils.js")

let assets = utils.loadAssetJSON("Energy/FuelTank.js")

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
