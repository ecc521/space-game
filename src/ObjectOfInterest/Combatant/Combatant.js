const ObjectOfInterest = require("../ObjectOfInterest.js")

class Combatant extends ObjectOfInterest {
	constructor(config = {}) {
		super(config)
		this.party = config.party || 0 //Combatants on the same party are allies.
		 //We will store party in an array, in case we want to allow for more complicated interactions in the future.
		 //The first number should indicate it's unique party, successive numbers those at which it is allies. Keep coloring easy even with complex interactions.
		if (!(this.party instanceof Array)) {this.party = [this.party]}

		if (!config.baseHull) {throw "config.baseHull must be specified"}
		this.modules = config.modules || []

		this.baseHull = config.baseHull
		this.hull = config.hull || this.baseHull

		this.onReceiveDamage = function(damageAmount, info = {}, sender) {
			//sender - the Combatant that resulted in the damage being dealt. May be undefined.
			//info - Details about the damage, such as for area damage.

			//Allow modules to adjust damage.
			this.getAffectedModules("onReceiveDamage").forEach((module) => {
				let result = module.onReceiveDamage(damageAmount, info, sender)
				if (typeof result === "number") {
					damageAmount = result
				}
			})
			this.hull -= damageAmount
			if (this.hull < 0) {this.destroy()}
		}

		this.destroy = function() {
			console.log("Destroy. ")
		}

		this.addModule = function(module) {
			this.modules.push(module)
		}

		this.removeModule = function(module) {
			if (this.modules.indexOf(module) === -1) {throw "Unable to remove non-existant module. "}
			this.modules.splice(this.modules.indexOf(module), 1)
		}

		this.getAffectedModules = function(callbackName) {
			//Obtain the modules with the specified callback.
			let modules = this.modules.filter((module) => {
				if (module[callbackName]) {
					return true
				}
			})

			//Sort the modules by specified priority.
			//We need to do this to avoid weird behaviors based on the ordering of modules.
			//Ex. A damage reduction module should come into effect before a shield module,
			//And a mirror module's effectiveness should not change based on it's ordering.
			let priorityName = callbackName + "Priority"
			modules.sort((b, a) => {
				return (a[priorityName] || 0) - (b[priorityName] || 0)
			})

			return modules
		}

		this.onTick = function() {
			this.modules.forEach((module) => {
				if (module.onTick) {
					module.onTick()
				}
			})
		}


	}
}

module.exports = Combatant
