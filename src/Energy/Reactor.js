//Reactor is a semi-passive power source. It refills the battery, using fuel from the fuel tank.
const utils = require("../utils.js")

let assets = utils.loadAssetJSON("Energy/Reactor.js")

class Reactor {
	constructor(config = {}) {
		this.verboseLogging = config.verboseLogging || false

		if (!config.battery) {
			throw "Must pass Battery"
		}
		if (!config.fuelTank) {
			throw "Must pass FuelTank"
		}
		if (!config.reactionSpeed) {
			throw "Must pass reactionSpeed, which must be greater than 0"
		}
		if (config.level === undefined) {
			throw "Must pass level, which must exist and be valid. Note that level refers to 0 indexed level. "
		}

		this.battery = config.battery
		this.fuelTank = config.fuelTank
		this.reactionSpeed = config.reactionSpeed
		this.level = config.level
		this.elements = Reactor.levels[this.level].elements


		function getPower(amounts) {
			return amounts.reduce((total, current, index) => {
				return total + (current * elements[index])
			}, 0)
		}


		function adjustFuelTank(tank, elementCount) {
			//Remove any elements that we can't use from fuel tank, and add slots for elements we can.
			for (let prop in tank) {
				if (Number(prop) > elementCount-1) {delete tank[prop]}
			}
			for (let i=0;i<elementCount;i++) {
				if (tank[i] === undefined) {tank[i] = 0}
			}
		}

		this.getRemainingPower = (function() {
			let maximum = Reactor.computeTotalPower(this.elements, 0, this.fuelTank.capacity)
			let energyDist = this.fuelTank.current.map(((amount, index) => {
				return Reactor.computeTotalPower(this.elements, index, amount)
			}).bind(this))

			let current = energyDist.reduce((a,b) => {return a+b}, 0)

			//Sum of elementDistribution should be 1.
			let elementDistribution = energyDist.map((amount) => {
				return amount / current
			})

			//Format to go directly into ResourceView fuel bar config. 
			return {
				current,
				max: maximum,
				elementDistribution
			}
		}).bind(this)

		this.onTick = (function() {
			adjustFuelTank(this.fuelTank.current, this.elements.length)

			let amountProcessable = config.reactionSpeed/globalThis.physicsTickRate

			//Begin the fusion process.
			let elementIndex = -1
			while (this.elements[++elementIndex]) {
				let energyLimit = this.battery.capacity - this.battery.chargeLevel
				let elementValue = this.elements[elementIndex]

				let currentElementAmount = this.fuelTank.current[elementIndex]
				let currentElementPower = currentElementAmount * elementValue

				if (this.verboseLogging) {console.log(currentElementAmount, amountProcessable, energyLimit/elementValue)}
				let amountProcessed = Math.min(currentElementAmount, amountProcessable, energyLimit/elementValue)
				let powerGenerated = amountProcessed * elementValue

				if (this.verboseLogging) {console.log(amountProcessed, powerGenerated)}

				if (isNaN(powerGenerated)) {continue} //This will be caused if currentElementAmount is 0.
				if (amountProcessed === 0) {continue}

				amountProcessable -= amountProcessed
				this.fuelTank.current[elementIndex] -= amountProcessed
				if (this.verboseLogging) {console.log("Consumed " + amountProcessed + " of element " + elementIndex)}

				//Add products.
				let products = Reactor.elementProducts[elementIndex]
				products.forEach((amount, index) => {
					if (this.verboseLogging) {console.log("Produced " + (amount * amountProcessed) + " of element " + index)}
					this.fuelTank.current[index] += amount * amountProcessed
				})

				if (this.verboseLogging) {console.log(powerGenerated)}
				this.battery.charge(powerGenerated)
			}

			if (this.verboseLogging) {console.log(amountProcessable)}

			if (amountProcessable > 0) {
				//TODO: Perform fission.
				//TODO: Consider using photodisintegration instead of fission, going to helium from heavier elements.
				//This could be a very effective balance change if upgraded reactors become too powerful.

				//"Fission" here refers to generating power from our lower grade elements, and using it to improve the grade of remaining elements.
				//We're going to make every element go up exactly one step here. We will start doing fission on our smallest elements other than hydrogen (ex, helium, carbon, etc),
				//as to maximize short term power output once full fusion resumes.

				//Also, note that this design only goes over fission products once.
				//This means that any element can only be moved upwards one stage per tick.
				//Downstream elements that produce an element (element loops - ex, helium => carbon => (fis) helium) will not have the (upstream) element processed immedietly.

				elementIndex = 0
				while (this.elements[++elementIndex]) {
					let currentElementAmount = this.fuelTank.current[elementIndex]
					let amountProcessed = Math.min(currentElementAmount, amountProcessable)

					if (amountProcessed === 0) {continue}

					//Total power differential between the current element and the previous element.
					let totalUpwardPower = Reactor.computeTotalPower(this.elements, elementIndex - 1) - Reactor.computeTotalPower(this.elements, elementIndex)

					//amountDownwards is the number of units that needs to move down in order for one unit to move up
					let amountDownwards = totalUpwardPower / this.elements[elementIndex]

					this.fuelTank.current[elementIndex] -= amountProcessed
					if (this.verboseLogging) {console.log("Consumed " + amountProcessed + " of element " + elementIndex)}

					//Send the fission product up.
					this.fuelTank.current[elementIndex - 1] += amountProcessed / (amountDownwards + 1)
					if (this.verboseLogging) {console.log("Produced " + (amountProcessed / (amountDownwards + 1)) + " of element " + (elementIndex - 1))}


					//Send the fusion products down.
					let products = Reactor.elementProducts[elementIndex]
					products.forEach((amount, index) => {
						//Amount: Percentage of products that are said element.
						let produced = amount * (1 - 1/(amountDownwards + 1)) * amountProcessed
						if (this.verboseLogging) {console.log("Produced " + produced + " of element " + index)}
						this.fuelTank.current[index] += produced
					})

					amountProcessable -= amountProcessed
				}
			}

			adjustFuelTank(this.fuelTank.current, this.elements.length)


		}).bind(this)
	}

	static elementNames = assets.elementNames
	static elementProducts = assets.elementProducts
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

	static computeTotalPower(energyAmounts, index, amount = 1) {
		//Computes the total amount of energy generated by "amount" units of the element at "index", for the provided energy amounts.
		let energy = 0
		energy += energyAmounts[index] * amount

		let products = Reactor.elementProducts[index]
		products.forEach((productAmount, index) => {
			if (productAmount > 0) {
				energy += Reactor.computeTotalPower(energyAmounts, index, amount * productAmount)
			}
		})

		return energy
	}
}

module.exports = Reactor
