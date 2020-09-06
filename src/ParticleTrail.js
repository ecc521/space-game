class ParticleTrail {
	constructor(config = {}) {
		config.rotation = config.rotation || 0
		config.rotationVariance = config.rotationVariance || 0

		const texture = ParticleTrail.createTexture(0, 8, app.renderer.resolution);

		this.emitter = new PIXI.particles.Emitter(config.parent, [texture], {
		  autoUpdate: true,
		  alpha: {
		    start: 0.8,
		    end: 0.15
		  },
		  scale: {
		    start: 1,
		    end: 0.4,
		    minimumScaleMultiplier: 1
		  },
		  color: {
		    start: "#e3f9ff",
		    end: "#2196F3"
		  },
		  speed: {
		    start: config.startSpeed ?? 200,
		    end: config.endSpeed ?? 100,
		    minimumSpeedMultiplier: 1
		  },
		  acceleration: {
		    x: 0,
		    y: 0
		  },
		  maxSpeed: 0,
		  startRotation: {
		    min: config.rotation + config.rotationVariance,
		    max: config.rotation - config.rotationVariance
		  },
		  noRotation: true,
		  rotationSpeed: {
		    min: 0,
		    max: 0
		  },
		  lifetime: {
		    min: 0.5,
		    max: 0.5
		  },
		  blendMode: "normal",
		  frequency: 0.005,
		  emitterLifetime: -1,
		  maxParticles: 100,
		  pos: {
		    x: 0,
		    y: 0
		  },
		  addAtBack: false,
		  spawnType: "point"
		});

		this.mult = 1;
		this.speed = config.speed || 0.01;
		this.maxDiff = config.maxDiff || .3
		this.animationFrame = (function() {
			//This is a UI component. Does not need to be aligned along with physics ticks.
			this.mult += this.speed
			if (Math.abs(this.mult - 1) > this.maxDiff) {
				this.speed *= -1
			}
			this.emitter.minimumScaleMultiplier = this.mult
			this.emitter.minimumSpeedMultiplier = this.mult
		}).bind(this)
	}


	//Creates a radial gradient for particle emitter.
	static createTexture(r1, r2, resolution) {
	  const c = (r2 + 1) * resolution;
	  r1 *= resolution;
	  r2 *= resolution;

	  const canvas = document.createElement("canvas");
	  const context = canvas.getContext("2d");
	  canvas.width = canvas.height = c * 2;

	  const gradient = context.createRadialGradient(c, c, r1, c, c, r2);
	  gradient.addColorStop(0, "rgba(255,255,255,1)");
	  gradient.addColorStop(1, "rgba(255,255,255,0)");

	  context.fillStyle = gradient;
	  context.fillRect(0, 0, canvas.width, canvas.height);

	  return PIXI.Texture.from(canvas);
	}
}

module.exports = ParticleTrail
