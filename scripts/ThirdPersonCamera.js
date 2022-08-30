import {Vector3} from 'three'

export default class ThirdPersonCamera {
	constructor(params) {
		this.params = params
		this.camera = params.camera

		this.currentPosition = new Vector3()
		this.currentLookat = new Vector3()
	}

	calculateIdealOffset() {
		const idealOffset = new Vector3(-15, 20, -30)
		idealOffset.applyQuaternion(this.params.target.Rotation)
		idealOffset.add(this.params.target.Position)
		return idealOffset
	}

	calculateIdealLookat() {
		const idealLookat = new Vector3(0, 10, 50)
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