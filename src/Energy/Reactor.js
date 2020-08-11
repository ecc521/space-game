//Reactor is a semi-passive power source. It refills the battery, using fuel from the fuel tank.
const path = require("path")
const utils = require(path.join(__dirname, "../", "utils.js"))

let assets = utils.loadAssetJSON(__filename)

class Reactor {
	constructor(config = {}) {

	}

	static description = assets.description
	static levels = assets.levels

	static getDesignWeight(config = {}) {
		let levelData = Reactor.levels[config.level - 1]

		if (levelData === undefined) {throw "Invalid config.level: " + config.level}
		console.log(levelData)
		let ratio = utils.relativeCost(config.reactionSpeed, levelData.reactionSpeed[0], levelData.reactionSpeed[1])

		console.log(ratio)

		let weight = levelData.weight[0] + (ratio * (levelData.weight[1] - levelData.weight[0]))

		return weight
	}
}

module.exports = Reactor
