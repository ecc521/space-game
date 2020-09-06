const ObjectOfInterest = require("./ObjectOfInterest.js")

class Planet extends ObjectOfInterest {
	constructor(config) {
		this.navigationTarget = true
		super(config)
	}
}

module.exports = Planet
