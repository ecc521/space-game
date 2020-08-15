class TickManager {
	//A central class for managing the execution order of the game.
	constructor() {
		this.orders = []

		let locked = false;

		this.acquireLock = (function(priority) {
			return new Promise((resolve, reject) => {
				this.orders.push([priority, resolve])
			})
		}).bind(this)

		this.processTick = function() {
			//Proceed through all orders.
			
		}
	}
}
