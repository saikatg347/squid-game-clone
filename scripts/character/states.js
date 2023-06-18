function onGameOver(event) {
	const endGameDisplay = document.querySelector('.game-over-container')
	endGameDisplay.style.display = 'flex'
	endGameDisplay.firstElementChild.innerHTML =
		event === 'win' ? "You've won!" : 'You died!'
	const restartButton = document.getElementById('restart-button')
	restartButton.onclick = () => {
		window.location.reload()
	}
}

class State {
	constructor(parent) {
		this._parent = parent
	}

	Enter() {}
	Exit() {}
	Update() {}
}

class JumpState extends State {
	constructor(parent) {
		super(parent)

		this._FinishedCallback = () => {
			this._Finished()
		}
	}

	get Name() {
		return 'jump'
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations['jump'].action
		const mixer = curAction.getMixer()
		mixer.addEventListener('finished', this._FinishedCallback)

		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action

			curAction.reset()
			curAction.setLoop(THREE.LoopOnce, 1)
			curAction.clampWhenFinished = true
			curAction.crossFadeFrom(prevAction, 0.2, true)
			curAction.play()
		} else {
			curAction.play()
		}
	}

	_Finished() {
		this._Cleanup()
		this._parent.SetState('idle')
	}

	_Cleanup() {
		const action = this._parent._proxy._animations['jump'].action

		action.getMixer().removeEventListener('finished', this._CleanupCallback)
	}

	Exit() {
		this._Cleanup()
	}

	Update(_) {}
}

class DeathState extends State {
	constructor(parent) {
		super(parent)

		this._FinishedCallback = () => {
			this._Finished()
		}
	}

	get Name() {
		return 'death'
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations['death'].action
		const mixer = curAction.getMixer()
		mixer.addEventListener('finished', this._FinishedCallback)

		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action

			curAction.reset()
			curAction.setLoop(THREE.LoopOnce, 1)
			curAction.clampWhenFinished = true
			curAction.crossFadeFrom(prevAction, 0.2, true)
			curAction.play()
		} else {
			curAction.play()
		}
	}

	_Finished() {
		this._Cleanup()
		onGameOver('death')
	}

	_Cleanup() {
		const action = this._parent._proxy._animations['death'].action
		action.getMixer().removeEventListener('finished', this._CleanupCallback)
	}

	Exit() {
		this._Cleanup()
	}

	Update(_) {}
}

class WinState extends State {
	constructor(parent) {
		super(parent)

		this._FinishedCallback = () => {
			this._Finished()
		}
	}

	get Name() {
		return 'win'
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations['win'].action
		const mixer = curAction.getMixer()
		mixer.addEventListener('finished', this._FinishedCallback)

		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action

			curAction.reset()
			curAction.setLoop(THREE.LoopOnce, 1)
			curAction.clampWhenFinished = true
			curAction.crossFadeFrom(prevAction, 0.2, true)
			curAction.play()
		} else {
			curAction.play()
		}
	}

	_Finished() {
		this._Cleanup()
		onGameOver('win')
	}

	_Cleanup() {
		const action = this._parent._proxy._animations['win'].action
		action.getMixer().removeEventListener('finished', this._CleanupCallback)
	}

	Exit() {
		this._Cleanup()
	}

	Update(_) {}
}

class WalkState extends State {
	constructor(parent) {
		super(parent)
	}

	get Name() {
		return 'walk'
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations['walk'].action
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action

			curAction.enabled = true

			if (prevState.Name == 'run') {
				const ratio =
					curAction.getClip().duration / prevAction.getClip().duration
				curAction.time = prevAction.time * ratio
			} else {
				curAction.time = 0.0
				curAction.setEffectiveTimeScale(1.0)
				curAction.setEffectiveWeight(1.0)
			}

			curAction.crossFadeFrom(prevAction, 0.5, true)
			curAction.play()
		} else {
			curAction.play()
		}
	}

	Exit() {}

	Update(timeElapsed, input) {
		if (input.keys.forward || input.keys.backward) {
			if (input.keys.shift) {
				this._parent.SetState('run')
			}
			return
		}

		this._parent.SetState('idle')
	}
}

class WalkBackState extends State {
	constructor(parent) {
		super(parent)
	}

	get Name() {
		return 'walkBack'
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations['walkBack'].action
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action

			curAction.enabled = true

			if (prevState.Name == 'run' || prevState.Name == 'runBack') {
				const ratio =
					curAction.getClip().duration / prevAction.getClip().duration
				curAction.time = prevAction.time * ratio
			} else {
				curAction.time = 0.0
				curAction.setEffectiveTimeScale(1.0)
				curAction.setEffectiveWeight(1.0)
			}

			curAction.crossFadeFrom(prevAction, 0.5, true)
			curAction.play()
		} else {
			curAction.play()
		}
	}

	Exit() {}

	Update(timeElapsed, input) {
		if (input.keys.forward || input.keys.backward) {
			if (input.keys.shift) {
				this._parent.SetState(input.keys.backward ? 'runBack' : 'run')
			}
			return
		}

		this._parent.SetState('idle')
	}
}

class RunState extends State {
	constructor(parent) {
		super(parent)
	}

	get Name() {
		return 'run'
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations['run'].action
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action

			curAction.enabled = true

			if (prevState.Name == 'walk') {
				const ratio =
					curAction.getClip().duration / prevAction.getClip().duration
				curAction.time = prevAction.time * ratio
			} else {
				curAction.time = 0.0
				curAction.setEffectiveTimeScale(1.0)
				curAction.setEffectiveWeight(1.0)
			}

			curAction.crossFadeFrom(prevAction, 0.5, true)
			curAction.play()
		} else {
			curAction.play()
		}
	}

	Exit() {}

	Update(timeElapsed, input) {
		if (input.keys.forward || input.keys.backward) {
			if (!input.keys.shift) {
				this._parent.SetState('walk')
			}
			return
		}

		this._parent.SetState('idle')
	}
}

class RunBackState extends State {
	constructor(parent) {
		super(parent)
	}

	get Name() {
		return 'runBack'
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations['runBack'].action
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action

			curAction.enabled = true

			if (prevState.Name == 'walk' || prevState.Name == 'walkBack') {
				const ratio =
					curAction.getClip().duration / prevAction.getClip().duration
				curAction.time = prevAction.time * ratio
			} else {
				curAction.time = 0.0
				curAction.setEffectiveTimeScale(1.0)
				curAction.setEffectiveWeight(1.0)
			}

			curAction.crossFadeFrom(prevAction, 0.5, true)
			curAction.play()
		} else {
			curAction.play()
		}
	}

	Exit() {}

	Update(timeElapsed, input) {
		if (input.keys.forward || input.keys.backward) {
			if (!input.keys.shift) {
				this._parent.SetState(input.keys.backward ? 'walkBack' : 'walk')
			}
			return
		}

		this._parent.SetState('idle')
	}
}

class IdleState extends State {
	constructor(parent) {
		super(parent)
	}

	get Name() {
		return 'idle'
	}

	Enter(prevState) {
		const idleAction = this._parent._proxy._animations['idle'].action
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action
			idleAction.time = 0.0
			idleAction.enabled = true
			idleAction.setEffectiveTimeScale(1.0)
			idleAction.setEffectiveWeight(1.0)
			idleAction.crossFadeFrom(prevAction, 0.5, true)
			idleAction.play()
		} else {
			idleAction.play()
		}
	}

	Exit() {}

	Update(_, input) {
		if (input.keys.forward) {
			this._parent.SetState('walk')
		} else if (input.keys.backward) {
			this._parent.SetState('walkBack')
		} 
		// else if (input.keys.space) {
		// 	this._parent.SetState('jump')
		// }
	}
}

export {
	JumpState,
	IdleState,
	WalkState,
	RunState,
	WalkBackState,
	RunBackState,
	DeathState,
	WinState,
}
