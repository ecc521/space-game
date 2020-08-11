class TickManager {
	//A central class for managing the execution order of the game.
	constructor() {
		this.orders = []
		this.acquireLock = (function() {

		}).bind(this)
		this.releaseLock = (function() {
			//We can't proceed to the next item until a lock is released. Therefore, we want a way to quickly debug locks.
			//We should throw a warning every time a lock is held for a reasonable amount of time. 
		}).bind(this)
	}
}
