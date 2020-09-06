//Superclass for Planets, Comets, Stations, and other non-moving non-combatant objects.
//All points-of-interest can be used as navigation targets.
class ObjectOfInterest {
	constructor(config = {}) {
		this.coordinates = config.coordinates || {x: 0, y: 0}

		this.navigationTarget = config.navigationTarget || false

	}
}

module.exports = ObjectOfInterest
