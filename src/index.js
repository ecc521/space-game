import * as PIXI from 'pixi.js';
window.PIXI = PIXI
PIXI.particles = require("pixi-particles")

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
PIXI.Application.prototype.render = null; // Disable auto-rendering by removing the function
const app = new PIXI.Application({
	autoResize: true,
	resolution: window.devicePixelRatio,
	antialias: true,
	//powerPreference: "high-performance", //"high-performance", "low-power" or "default".
	resizeTo: window,
});
window.app = app

const stage = app.stage
window.stage = stage
stage.sortableChildren = true //Allow zIndex to work.

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);
globalThis.physicsTickRate = 10



;(async function load() {
	let loader = new PIXI.Loader()
	console.log(loader)
	loader.add("jsonAssets", "packages/assets.json")

	loader.add("lightShield", "assets/icons/lightShield.svg")
	loader.add("standardShield", "assets/icons/standardShield.svg")
	loader.add("heavyShield", "assets/icons/heavyShield.svg")

	loader.add("repulse", "assets/icons/repulse.svg")
	loader.add("vortex", "assets/icons/vortex.svg")

	loader.add("techtree", "assets/interface/techtree.svg")
	loader.add("credits", "assets/interface/credits.svg")
	loader.add("battery", "assets/interface/battery.svg")
	loader.add("hydrogen", "assets/interface/hydrogen.svg")
	loader.add("helium", "assets/interface/helium.svg")
	loader.add("carbon", "assets/interface/carbon.svg")
	loader.add("neon", "assets/interface/neon.svg")
	loader.add("oxygen", "assets/interface/oxygen.svg")
	loader.add("silicon", "assets/interface/silicon.svg")

	loader.add("space1", "assets/backgrounds/space1.jpeg")
	loader.add("space2", "assets/backgrounds/space2.jpeg")
	loader.add("space3", "assets/backgrounds/space3.jpeg")



	for (let i=1;i<=5;i++) {
		loader.add("level" + i + "ship", "assets/ships/level" + i + ".svg")
	}

	for (let i=0;i<15;i++) {
		let extension = ".png"
		if ([7, 11].includes(i)) {extension = ".svg"}
		loader.add("planet" + i, "assets/objects/planets/planet" + i + extension)
	}

	loader.onProgress.add(function(event, item) {
		console.log("Loaded " + item.url + ". " + Math.round(event.progress) + "% complete. ")
	})

	await new Promise((resolve, reject) => {
		loader.load(resolve)
	})

	let resources = loader.resources

	//Force re-rasterization of all SVG images.
	console.time("force-reraster")
	let minSize = 500
	for (let prop in resources) {
	    let item  = resources[prop]
		if (item.extension === "svg") {
			console.log(item)
			console.log(item.texture)
			let minDimension = Math.min(item.data.width, item.data.height)
			if (minDimension < minSize) {
				let multiplier = minSize / minDimension
				console.log(`Adjusted resoultion from ${item.data.width}x${item.data.height}`)
				item.data.width = Math.ceil(item.data.width * multiplier)
				item.data.height = Math.ceil(item.data.height * multiplier)
				console.log(`to ${item.data.width}x${item.data.height}`)
				item.texture = PIXI.Texture.from(item.data)
			}
			else {
				console.log("Item has enough resolution")
			}
		}
	}
	console.timeEnd("force-reraster")

	window.resources = resources
 	window.jsonAssets = resources.jsonAssets.data

	window.Battery = require("./Energy/Battery.js")
	window.FuelTank = require("./Energy/FuelTank.js")
	window.Reactor = require("./Energy/Reactor.js")
	window.TechTree = require("./TechTree.js")
	window.ResourceView = require("./ResourceView.js")
	window.Map = require("./Map.js")
	window.ParticleTrail = require("./ParticleTrail.js")
	window.HomeSystem = require("./HomeSystem.js")
	window.utils = require("./utils.js")

	let tech = new TechTree();
	stage.addChild(tech.sprite);
	tech.resize()

	window.resourceView = new ResourceView()
	resourceView.render({
		credits: 500,
		battery: [100, 150],
		elements: [400, 250, 133, 112, 76, 22],
		fuel: {
			current: 100,
			max: 200,
			elementDistribution: [0.6, 0.2, 0.1, 0.05, 0.03, 0.02]
		}
	})

	/*window.map = new Map({
		width: 2000,
		height: 2000,
		bounds: {}, //Use defaults
		backgroundOptions: ["space1", "space2", "space3"]
	})*/


	let config = utils.loadAssetJSON("HomeSystem.js")
	Object.assign(config, {
		bounds: {}, //Use defaults
		backgroundOptions: {
			textures: ["space1", "space2", "space3"],
		}
	})
	window.map = new HomeSystem(config)

	stage.addChild(map.container)

	/*window.particleTrail = new ParticleTrail({
		parent: app.stage,
		rotation: 90,
		rotationVariance: 0,
		speed: 0.05
	})
	particleTrail.emitter.spawnPos.x = 400
	particleTrail.emitter.spawnPos.y = 400*/

	window.frames = 0

	setInterval(function() {
		window.frames++
		app.renderer.render(app.stage)
		particleTrail.animationFrame()
		map.onTick()
	}, 120)

}())
