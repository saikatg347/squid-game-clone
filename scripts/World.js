import {WebGLRenderer, PCFSoftShadowMap, Scene, sRGBEncoding} from 'three'

import { initLighting, initBackground, initFloor, initCamera } from './initEnvironment'

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

		if(this.controls) {
			this.controls.Update(timeElapsedS)
		}

		this.thirdPersonCamera.Update(timeElapsedS)
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}
}
