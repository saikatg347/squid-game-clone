export const gameState = {
  isDead: false,
  isWinner: false,
  isRunning: false,
  time: 0,
  greenLight: false,
  lastUpdated: 0,
  async startCountDown() {
    const counter = document.getElementById('counter')
    let count = 0
    const interval = setInterval(() => {
      count++
      counter.innerHTML = 4 - count
      if(count == 4) {
        clearInterval(interval)
        const audioPlayer = document.getElementById('audio-player')
        audioPlayer.click()
        counter.style.display = 'none'
        this.lastUpdated = this.time
        this.isRunning = true
        this.greenLight = true
      }
    }, 1000)
  }
}
