//Parent class for modules.

class Module {
	constructor(config = {}) {
		let types =
			"passive", //Entirely passive, always on if enabled
			"flexible", //Can be arbitrarily activated and deactivated, potentially with energy costs while on, max durations, limits, and cooldowns.
			"active", //Flexible, except activations are seperate, explicit events, and can't be arbitrarily deactivated.
		]


		this.activationCooldown = config.activationCooldown || 0 //Cooldown between activations for active, cooldown ratio once deactivated for flexible.
		this.activationLimit = config.activationLimit || Infinity //Max total duration for flexible, activation limit for active

		//Note: Energy cost will be heavily extended. Teleport will cost more based on teleport suppression fields and distance,
		//Multiplexers will affect cost of AoE mods with multiple affected parties, mods won't cost anything when not in effect, etc.
		this.energyCost = config.energyCost || 0 //Energy cost over time for passive & flex, per use for active.

		this.remainingCooldown = 0;
		this.getEnergyCost = function(activationParams) {
			return this.energyCost
		}

		this.activate = function(activationParams) {
			if (this.activationLimit <= 0) {
				throw "No Activations Remaining. "; //Can't activate. No activations left.
			}
			else if (this.remainingCooldown > 0) {
				throw "Module Still in Cooldown"
			}

			//TODO: Begin charging module.
			console.log("Module should begin charging. ")
		}

		this.getObjectsWithinRange = function(distance, onlyTargets = false) {

		}

	}
}

module.exports = Module
