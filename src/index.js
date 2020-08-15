import * as PIXI from 'pixi.js';
window.PIXI = PIXI

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application({
	autoResize: true,
	resolution: window.devicePixelRatio,
	antialias: true,
	resizeTo: window
});
window.app = app

const stage = app.stage
window.stage = stage

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);




;(async function load() {
	let loader = new PIXI.Loader()
	console.log(loader)
	loader.add("jsonAssets", "packages/assets.json")
	loader.add("spaceship", "assets/triangle-ship.svg")

	loader.add("lightShield", "assets/icons/lightShield.svg")
	loader.add("standardShield", "assets/icons/standardShield.svg")
	loader.add("heavyShield", "assets/icons/heavyShield.svg")

	loader.add("repulse", "assets/icons/repulse.svg")
	loader.add("vortex", "assets/icons/vortex.svg")

	loader.add("techtree", "assets/interface/techtree.svg")


	for (let i=1;i<=5;i++) {
		loader.add("level" + i + "ship", "assets/ships/level" + i + ".svg")
	}

	loader.onProgress.add(console.log)

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
	let tech = new TechTree();
	stage.addChild(tech.sprite);
	tech.resize()

	stage.interactive = true
	var isDragging = false,
        prevX, prevY;

    stage.on("mousedown", function (moveData) {
      var pos = moveData.data.global;
      prevX = pos.x; prevY = pos.y;
      isDragging = true;
  });

    stage.on("mousemove", function (moveData) {
      if (!isDragging) {
        return;
      }
      var pos = moveData.data.global;
      var dx = pos.x - prevX;
      var dy = pos.y - prevY;

      stage.x += dx;
      stage.y += dy;
      prevX = pos.x; prevY = pos.y;
  });

    stage.on("mouseup", function (moveData) {
      isDragging = false;
  });

	// load the texture we need
	// This creates a texture from a 'bunny.png' image

	const bunny = new PIXI.Sprite(resources.level1ship.texture);

	// Setup the position of the bunny
	bunny.x = app.renderer.width / 4;
	bunny.y = app.renderer.height / 4;

	// Rotate around the center
	bunny.anchor.x = 0.5;
	bunny.anchor.y = 0.5;

	window.bunny = bunny


	// Add the bunny to the scene we are building
	app.stage.addChild(bunny);
	bunny.interactive = true
	bunny.on("click", console.log)
	bunny.on("tap", console.log)

	// Listen for frame updates
	app.ticker.add(() => {
		 // each frame we spin the bunny around a bit
		//bunny.rotation += 0.01;
	});

}())
