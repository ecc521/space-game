
(async function() {
	let request = await fetch("packages/assets.json")
 	window.jsonAssets = await request.toJSON()

	Battery = require("./Energy/Battery.js")
	FuelTank = require("./Energy/FuelTank.js")
	Reactor = require("./Energy/Reactor.js")
})
