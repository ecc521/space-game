const Module = require("./Module.js")

class Shield extends Module {
	constructor(config = {}) {
		super(config)

		this.onReceiveDamage = function(damageAmount, info, sender) {

		}
		this.onReceiveDamagePriority = 0
	}
}

module.exports = Shield
