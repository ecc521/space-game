Architecture:
- Needs a tick based design that allows for complete and accurate replays.
- Tick rate must be the same across all platforms, however frame rate can vary. Sub-ticks could be rendered, or we could simply have a tick rate high enough to avert frame rate problems.


Sample script:


//File description.
const path = require("path")
const utils = require(path.join(__dirname, "../", "utils.js"))

let assets = utils.loadAssetJSON(__filename)

class ClassName {
	constructor(config = {}) {

	}

	static description = assets.description
	static levels = assets.levels

	static createDesign() {

	}
}

module.exports = ClassName
