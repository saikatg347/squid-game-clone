import { Vector3, Quaternion, AnimationMixer, LoadingManager } from 'three'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'



import InputHandler from './inputHandler'
import { CharacterFSM } from './finiteStateMachine'

import {gameState} from '../gameState'

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
		this._decceleration = new Vector3(-0.0005, -0.0001, -5.0)
		this._acceleration = new Vector3(1, 0.25, 50.0)
		this._velocity = new Vector3(0, 0, 0)
		this._position = new Vector3()

		this._animations = {}
		this._input = new InputHandler()

		this._stateMachine = new CharacterFSM(
			new BasicCharacterControllerProxy(this._animations)
		)

		this._LoadModels()
	}

	_LoadModels() {
		const loader = new FBXLoader()
		loader.setPath('assets/Bot/')
		loader.load('Bot.fbx', (fbx) => {
			fbx.scale.setScalar(0.1)
			fbx.traverse((c) => {
				c.castShadow = true
			})

			this._target = fbx
			this._params.scene.add(this._target)

			this._mixer = new AnimationMixer(this._target)

			this._manager = new LoadingManager()
			
			const progressBar = document.getElementById('progress-bar')
			this._manager.onProgress = (url, loaded, total) => {
				progressBar.value = (loaded / total) * 100
			}
			
			const progressContainer = document.querySelector('.progress-bar-container')

			this._manager.onLoad = () => {
				progressContainer.style.display = 'none'
				this._stateMachine.SetState('idle')
			}

			const _OnLoad = (animName, anim) => {
				const clip = anim.animations[0]
				const action = this._mixer.clipAction(clip)

				this._animations[animName] = {
					clip: clip,
					action: action,
				}
			}

			const loader = new FBXLoader(this._manager)
			loader.setPath('assets/Bot/')
			loader.load('idle.fbx', (a) => {
				_OnLoad('idle', a)
			})
			loader.load('standingJump.fbx', (a) => {
				_OnLoad('standingJump', a)
			})
			loader.load('walk.fbx', (a) => {
				_OnLoad('walk', a)
			})
			loader.load('walkBack.fbx', (a) => {
				_OnLoad('walkBack', a)
			})
			loader.load('run.fbx', (a) => {
				_OnLoad('run', a)
			})
			loader.load('runBack.fbx', (a) => {
				_OnLoad('runBack', a)
			})
			loader.load('runningJump.fbx', (a) => {
				_OnLoad('runningJump', a)
			})
			loader.load('dance.fbx', (a) => {
				_OnLoad('dance', a)
			})
			loader.load('death.fbx', (a) => {
				_OnLoad('death', a)
			})
		})
	}

	get Position() {
		return this._position
	}

	get Rotation() {
		if (!this._target) {
			return new Quaternion()
		}
		return this._target.quaternion
	}

	Update(timeInSeconds) {
		if (!this._stateMachine._currentState) {
			return
		}

		this._stateMachine.Update(timeInSeconds, this._input)

		const velocity = this._velocity
		const frameDecceleration = new Vector3(
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
		const _Q = new Quaternion()
		const _A = new Vector3()
		const _R = controlObject.quaternion.clone()

		const acc = this._acceleration.clone()
		acc.multiplyScalar(3.5)
		if (this._input.keys.shift) {
			acc.multiplyScalar(2.1)
		}
		let backAcc = 1.5
		let sidewayAcc = 4.0
		if (gameState.isDead) {
			acc.multiplyScalar(0.0)
			backAcc = 0
			sidewayAcc = 0 
			this._stateMachine.SetState('death')
		}
		if (this._stateMachine._currentState.Name == 'dance') {
			acc.multiplyScalar(0.0)
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

		const oldPosition = new Vector3()
		oldPosition.copy(controlObject.position)

		const forward = new Vector3(0, 0, 1)
		forward.applyQuaternion(controlObject.quaternion)
		forward.normalize()

		const sideways = new Vector3(1, 0, 0)
		sideways.applyQuaternion(controlObject.quaternion)
		sideways.normalize()

		sideways.multiplyScalar(velocity.x * timeInSeconds)
		forward.multiplyScalar(velocity.z * timeInSeconds)

		controlObject.position.add(forward)
		controlObject.position.add(sideways)

		this._position.copy(controlObject.position)

		if (this._mixer) {
			this._mixer.update(timeInSeconds)
		}
	}
}
