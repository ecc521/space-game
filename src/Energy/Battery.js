//Battery is the active power source. Any power needs come out of the battery. Power drains in excess of current battery capacity will need to wait on the reactor.
const utils = require("../utils.js")

let assets = utils.loadAssetJSON("Energy/Battery.js")

class Battery {
	constructor(config = {}) {
		if (!config.capacity) {throw "Must pass capacity, which must be greater than 0"}

		this.capacity = config.capacity
		this.chargeLevel = this.capacity //Batteries will start full.


		this.powerRequests = []
		this.requestPower = function(amount, callback) {
			this.powerRequests.push([amount, callback])
		}

		this.charge = function(amount) {
			this.chargeLevel += amount
			let powerGained = amount - Math.max(0, this.chargeLevel - this.capacity)
			this.chargeLevel = Math.min(this.capacity, this.chargeLevel)
			return powerGained //powerGained is the actual amount of power the battery charged by.
		}

		this.resolvePowerRequests = function() {
			//Sort highest to lowest by power requested.
			this.powerRequests.sort((a, b) => {
				return b[0] - a[0]
			})
			//Allocate each request either it's remaining share of available power, or it's entire capacity, whichever is smaller. Since this is sorted,
			//we can assure that we finish small requests, and allocate the same amount of power to all unfinished requests.
			while (this.powerRequests[0]) {
				let powerPerRequest = this.chargeLevel/this.powerRequests.length

				let request = this.powerRequests.pop()
				let requestedAmount = request[0]
				let callback = request[1]

				let powerGiven = Math.min(powerPerRequest, requestedAmount)
				this.chargeLevel -= powerGiven
				callback(powerGiven)
			}
		}

		this.onTick = this.resolvePowerRequests
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
