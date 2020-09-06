const ObjectOfInterest = require("./ObjectOfInterest.js")

class Comet extends ObjectOfInterest {
	constructor(config) {
		this.navigationTarget = true
		super(config)
	}
}

module.exports = Comet
