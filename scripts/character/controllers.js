// import { THREE.Vector3, Quaternion, AnimationMixer, LoadingManager } from 'three'

// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import InputHandler from './inputHandler.js'
import { CharacterFSM } from './finiteStateMachine.js'

import { gameState } from '../gameState.js'

class BasicCharacterControllerProxy {
	constructor(animations) {
		this._animations = animations
	}

	get animations() {
		return this._animations
	}
}

export default class BasicCharacterController {
	constructor(params) {
		this._Init(params)
	}

	_Init(params) {
		this._params = params
		this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0)
		this._acceleration = new THREE.Vector3(1, 0.25, 50.0)
		this._velocity = new THREE.Vector3(0, 0, 0)
		this._position = new THREE.Vector3()

		this._animations = {}
		this._input = new InputHandler()

		this._stateMachine = new CharacterFSM(
			new BasicCharacterControllerProxy(this._animations)
		)

		this._LoadModels()
	}

	_LoadModels() {
		this._manager = new THREE.LoadingManager()
		const progressContainer = document.querySelector('.progress-bar-container')

		this._manager.onLoad = () => {
			progressContainer.style.display = 'none'
			gameState.startCountDown()
			this._stateMachine.SetState('idle')
		}

		const loader = new THREE.GLTFLoader(this._manager)
		loader.load('assets/tree.glb', (glb) => {
			const treeModel = glb.scene
			treeModel.scale.setScalar(30)
			treeModel.position.set(0, 0, 380)
			treeModel.traverse(obj => {
				if(obj.isMesh) obj.castShadow = true
			})
			this._params.scene.add(treeModel)
		})
		loader.load('assets/dollBody.glb', (glb) => {
			const bodyModel = glb.scene
			bodyModel.scale.setScalar(6)
			bodyModel.position.set(0, 0, 340)
			bodyModel.traverse(obj => {
				if(obj.isMesh) obj.castShadow = true
			})
			this._params.scene.add(bodyModel)
		})
		loader.load('assets/dollHead.glb', (glb) => {
			const headModel = glb.scene
			headModel.scale.setScalar(6)
			headModel.position.set(0, 0, 340)
			headModel.traverse(obj => {
				if(obj.isMesh) obj.castShadow = true
			})
			this.dollHead = headModel
			this._params.scene.add(headModel)
		})
		loader.load('assets/player.glb', (glb) => {
			const model = glb.scene
			model.scale.setScalar(10)
			model.position.set(0, -0.1, -370)
			model.traverse((object) => {
				if (object.isMesh) object.castShadow = true
			})

			this._target = model
			this._params.scene.add(this._target)

			this._mixer = new THREE.AnimationMixer(this._target)

			const _OnLoad = (animName, anim) => {
				const clip = anim
				const action = this._mixer.clipAction(clip)

				this._animations[animName] = {
					clip: clip,
					action: action,
				}
			}

			const animations = glb.animations
			animations.forEach((a) => {
				_OnLoad(a.name, a)
			})
		})
	}

	get Position() {
		return this._position
	}

	get Rotation() {
		if (!this._target) {
			return new THREE.Quaternion()
		}
		return this._target.quaternion
	}

	Update(timeInSeconds) {
		if (!this._stateMachine._currentState) {
			return
		}

		this._stateMachine.Update(timeInSeconds, this._input)

		const velocity = this._velocity
		const frameDecceleration = new THREE.Vector3(
			velocity.x * this._decceleration.x,
			velocity.y * this._decceleration.y,
			velocity.z * this._decceleration.z
		)
		frameDecceleration.multiplyScalar(timeInSeconds)
		frameDecceleration.z =
			Math.sign(frameDecceleration.z) *
			Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z))

		velocity.add(frameDecceleration)

		const controlObject = this._target
		const _Q = new THREE.Quaternion()
		const _A = new THREE.Vector3()
		const _R = controlObject.quaternion.clone()

		const acc = this._acceleration.clone()
		acc.multiplyScalar(2)
		if (this._input.keys.shift) {
			acc.multiplyScalar(3)
		}
		let backAcc = .5
		let sidewayAcc = 4.0
		if (!gameState.isRunning) {
			acc.multiplyScalar(0.0)
			backAcc = 0
			sidewayAcc = 0
		}
		if (gameState.isWinner) {
			acc.multiplyScalar(0.0)
			backAcc = 0
			sidewayAcc = 0
			this._stateMachine.SetState('win')
		} else if (gameState.isDead) {
			acc.multiplyScalar(0.0)
			backAcc = 0
			sidewayAcc = 0
			const sniper = document.getElementById('sniper')
			this._stateMachine.SetState('death')
		}
		if (this._stateMachine._currentState.Name == 'jump') {
			acc.multiplyScalar(0.0)
			backAcc = 0
			sidewayAcc = 0
		}

		if (this._input.keys.forward) {
			velocity.z += acc.z * timeInSeconds
		}
		if (this._input.keys.backward) {
			velocity.z -= acc.z * timeInSeconds - backAcc
		}
		if (this._input.keys.left) {
			_A.set(0, 1, 0)
			_Q.setFromAxisAngle(
				_A,
				sidewayAcc * Math.PI * timeInSeconds * this._acceleration.y
			)
			_R.multiply(_Q)
		}
		if (this._input.keys.right) {
			_A.set(0, 1, 0)
			_Q.setFromAxisAngle(
				_A,
				sidewayAcc * -Math.PI * timeInSeconds * this._acceleration.y
			)
			_R.multiply(_Q)
		}

		controlObject.quaternion.copy(_R)

		const oldPosition = new THREE.Vector3()
		oldPosition.copy(controlObject.position)

		const forward = new THREE.Vector3(0, 0, 1)
		forward.applyQuaternion(controlObject.quaternion)
		forward.normalize()

		const sideways = new THREE.Vector3(1, 0, 0)
		sideways.applyQuaternion(controlObject.quaternion)
		sideways.normalize()

		forward.multiplyScalar(velocity.z * timeInSeconds)
		sideways.multiplyScalar(velocity.x * timeInSeconds)

		const newX = controlObject.position.x + forward.x
		const newY = controlObject.position.y + forward.y
		const newZ = controlObject.position.z + forward.z

		const XLIMIT = 245
		const ZLIMIT = 395

		controlObject.position.x = newX > XLIMIT ? XLIMIT : newX < -XLIMIT ?  -XLIMIT : newX
		controlObject.position.y = newY
		controlObject.position.z = newZ > ZLIMIT ? ZLIMIT : newZ < -ZLIMIT ? -ZLIMIT : newZ

		// controlObject.position.add(forward)
		controlObject.position.add(sideways)

		this._position.copy(controlObject.position)

		if (this._mixer) {
			this._mixer.update(timeInSeconds)
		}
	}
}
