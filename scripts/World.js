import { gameState } from './gameState.js'

import InputHandler from './character/inputHandler.js'

import {
	initLighting,
	initBackground,
	initFloor,
	initCamera,
	initWalls,
} from './initEnvironment.js'

import BasicCharacterController from './character/controllers.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'

export default class World {
	constructor() {
		this._initialize()
	}

	_initialize() {
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.outputEncoding = THREE.sRGBEncoding
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		document.body.appendChild(this.renderer.domElement)

		window.addEventListener(
			'resize',
			() => {
				this.onWindowResize()
			},
			false
		)

		this.camera = initCamera()

		this.scene = new THREE.Scene()

		initLighting(this.scene)

		initBackground(this.scene)

		initFloor(this.scene)

		initWalls(this.scene)

		this.mixers = []
		this.previousTick = null

		this.loadAnimatedModel()
		this.tick()
	}

	loadAnimatedModel() {
		const params = {
			camera: this.camera,
			scene: this.scene,
		}
		this.controls = new BasicCharacterController(params)

		this.inputs = this.controls._input.keys

		this.counter = document.getElementById('counter')

		this.thirdPersonCamera = new ThirdPersonCamera({
			camera: this.camera,
			target: this.controls,
		})
	}

	tick() {
		requestAnimationFrame((t) => {
			if (this.previousTick === null) {
				this.previousTick = t
			}

			this.tick()

			// const time = Math.floor(this.previousTick / 1000)
			const time = this.previousTick / 1000
			gameState.time = time

			if (gameState.isRunning) {
				const timeElapsed = time - gameState.lastUpdated

				if(time > 120) {
				 this.kill()
				}

				if (this.controls._position.z >= 290) {
					gameState.isWinner = true	
				}

				if (gameState.greenLight) {
					if (timeElapsed >= 5.5) {
						this.controls.dollHead.rotateY(Math.PI)
						this.controls.dollHead.position.set(0, 0, 328)
						this.switchLight(time)
					}
				} else {
					if (this.checkMovement()) {
						this.kill()
					}

					if (timeElapsed >= 6) {
						this.controls.dollHead.rotateY(Math.PI)
						this.controls.dollHead.position.set(0, 0, 340)
						this.sing()
						this.switchLight(time)
					}
				}
			}

			this.renderer.render(this.scene, this.camera)

			this.step(t - this.previousTick)
			this.previousTick = t
		})
	}

	step(timeElapsed) {
		const timeElapsedS = timeElapsed * 0.001
		if (this.mixers) {
			this.mixers.map((m) => m.update(timeElapsedS))
		}

		if (this.controls) {
			this.controls.Update(timeElapsedS)
		}

		this.thirdPersonCamera.Update(timeElapsedS)
	}

	kill() {
		if (!gameState.isDead && !gameState.isWinner) {
			const sniper = document.getElementById('sniper')
			sniper.click()
		}
		gameState.isDead = true
	}

	sing() {
		if (!gameState.isDead && !gameState.isWinner) {
			const audioPlayer = document.getElementById('audio-player')
			audioPlayer.click()
		}
	}

	checkMovement() {
		for (let key of Object.values(this.inputs)) {
			if (key) return true
		}
		return false
	}

	switchLight(time) {
		gameState.lastUpdated = time
		gameState.greenLight = !gameState.greenLight
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}
}
