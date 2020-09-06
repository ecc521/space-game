const Combatant = require("./Combatant.js")

class Outpost extends Combatant {
	constructor(config = {}) {
		config.navigationTarget = true
		super(config)
	}
}

module.exports = Outpost
