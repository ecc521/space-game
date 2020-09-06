const Combatant = require("./Combatant.js")

class Ship extends Combatant {
	constructor(config = {}) {
		super(config)

		if (!config.speed) {throw "config.speed must be passed. "}
		this.speed = config.speed

		this.navigateTo = function(navigationTarget) {
			
		}
	}
}

module.exports = Ship
