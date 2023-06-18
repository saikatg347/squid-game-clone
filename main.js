import World from './scripts/World.js'

const audioPlayer = document.getElementById('audio-player')
audioPlayer.onclick = () => {
	const audio = new Audio('assets/audio.mp3')
	audio.play()
}
const sniper = document.getElementById('sniper')
sniper.onclick = () => {
	const audio = new Audio('assets/gunshot.mp3')
	audio.play()
}

const startMenu = document.querySelector('.start-menu')
const startBtn = document.getElementById('start-btn')

startBtn.onclick = async () => {
	startMenu.style.display = 'none'
	const progressContainer = document.querySelector('.progress-bar-container')
	progressContainer.style.display = 'flex'
	const _App = new World()
}
