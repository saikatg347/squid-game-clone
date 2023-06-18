import { gameState } from './gameState.js'

export default class ThirdPersonCamera {
	constructor(params) {
		this.params = params
		this.camera = params.camera

		this.currentPosition = new THREE.Vector3()
		this.currentLookat = new THREE.Vector3()
	}

	calculateIdealOffset() {
		const idealOffset = new THREE.Vector3(-15, 20, -30)
		idealOffset.applyQuaternion(this.params.target.Rotation)
		idealOffset.add(this.params.target.Position)
		return idealOffset
	}

	calculateIdealLookat() {
		let varX = window.outerWidth < 450 ? 20 : 5
		let idealLookat = new THREE.Vector3(varX, 10, 30)
		idealLookat.applyQuaternion(this.params.target.Rotation)
		idealLookat.add(this.params.target.Position)
		return idealLookat
	}

	Update(timeElapsed) {
		const idealOffset = this.calculateIdealOffset()
		const idealLookat = this.calculateIdealLookat()

		const t = 1.0 - Math.pow(0.001, timeElapsed)

		this.currentPosition.lerp(idealOffset, t)
		this.currentLookat.lerp(idealLookat, t)

		this.camera.position.copy(this.currentPosition)
		this.camera.lookAt(this.currentLookat)
	}
}
