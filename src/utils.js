const fs = require("fs")
const path = require("path")

function loadAssetJSON(filePath) {
	filePath = path.join(path.dirname(filePath), path.basename(filePath, ".js") + ".json")
	let contents = fs.readFileSync(filePath, {encoding: "utf-8"})
	//TODO: We should use a javascript object-like JSON parser.
	let obj;
	try {
		eval("obj  = " + contents)
	}
	catch (e) {
		console.error(e)
		throw "Failed to parse JSON asset at " + filePath
	}
	return obj
}

function relativeCost(current, low, high, exponent = 1.4) {
	//The better the technology, the more disproportionate it's cost to include.

	if (!(current >= low && current <= high)) {throw "Was not low<=current<=high"}

    let lowRes = low ** exponent
	let currentRes = current ** exponent
    let highRes = high ** exponent

	console.log(lowRes, currentRes, highRes)

	let ratio = (currentRes-lowRes)/(highRes-lowRes)
    return ratio
}

module.exports = {
	loadAssetJSON,
	relativeCost
}
