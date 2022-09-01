import { WebGLRenderer, PCFSoftShadowMap, Scene, sRGBEncoding } from 'three'

import { gameState } from './gameState'

import InputHandler from './character/inputHandler'

import {
	initLighting,
	initBackground,
	initFloor,
	initCamera,
	initWalls,
} from './initEnvironment'

import BasicCharacterController from './character/controllers'
import ThirdPersonCamera from './ThirdPersonCamera'

export default class World {
	constructor() {
		this._initialize()
	}

	_initialize() {
		this.renderer = new WebGLRenderer({ antialias: true })
		this.renderer.outputEncoding = sRGBEncoding
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = PCFSoftShadowMap
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

		this.scene = new Scene()

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

			const time = Math.floor(this.previousTick / 1000)
			gameState.time = time

			if (gameState.isRunning) {
				const timeElapsed = time - gameState.lastUpdated

				if (this.controls._position.z > 200) {
					gameState.isWinner = true
				}

				if (gameState.greenLight) {
					console.log(timeElapsed, 'green light')
					if (timeElapsed >= 6) {
						this.switchLight(time)
					}
				} else {
					console.log(timeElapsed, 'red light')
					if (this.checkMovement()) {
						if (!gameState.isDead && !gameState.isWinner) {
							const sniper = document.getElementById('sniper')
							sniper.click()
						}
						gameState.isDead = true
					}

					if (timeElapsed >= 6) {
						if (!gameState.isDead && !gameState.isWinner) {
							const audioPlayer = document.getElementById('audio-player')
							audioPlayer.click()
						}
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
