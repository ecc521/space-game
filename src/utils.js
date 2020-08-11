function loadAssetJSON(filePath) {
	return window.jsonAssets[filePath]
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
