import { IdleState, JumpState, WalkState, RunState, WalkBackState, RunBackState, DeathState, WinState } from './states.js'

class FiniteStateMachine {
	constructor() {
		this._states = {}
		this._currentState = null
	}

	_AddState(name, type) {
		this._states[name] = type
	}

	SetState(name) {
		const prevState = this._currentState

		if (prevState) {
			if (prevState.Name == name) {
				return
			}
			prevState.Exit()
		}

		const state = new this._states[name](this)

		this._currentState = state
		state.Enter(prevState)
	}

	Update(timeElapsed, input) {
		if (this._currentState) {
			this._currentState.Update(timeElapsed, input)
		}
	}
}

export class CharacterFSM extends FiniteStateMachine {
	constructor(proxy) {
		super()
		this._proxy = proxy
		this._Init()
	}

	_Init() {
		this._AddState('idle', IdleState)
		this._AddState('walk', WalkState)
		this._AddState('run', RunState)
		this._AddState('jump', JumpState)
		this._AddState('walkBack', WalkBackState)
		this._AddState('runBack', RunBackState)
		this._AddState('death', DeathState)
		this._AddState('win', WinState)
	}
}
