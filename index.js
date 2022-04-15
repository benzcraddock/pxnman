import { LEVEL, OBJECT_TYPE } from './setup'
import { randomMovement } from './phantomMoves'
import GameBoard from './GameBoard'
import Guardian from './Guardian'
import Phantom from './Phantom'

// Sound
import soundDot from './sounds/munch.wav'
import soundPill from './sounds/pill.wav'
import soundGameStart from './sounds/phantom-takeover.mp3'
import soundGameOver from './sounds/death.wav'
import soundGhost from './sounds/ghost.wav'

// DOM elements
const gameGrid = document.querySelector('#game')
const scoreTable = document.querySelector('#score')
const startButton = document.querySelector('#start-button')

// Game constants
const POWER_PILL_TIME = 10000 // milliseconds
const GLOBAL_SPEED = 80 // milliseconds
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL)

// Initial setup
let score = 0
let timer = null
let gameWin = false
let powerPillActive = false
let powerPillTimer = null

// Audio
function playAudio(audio) {
  const soundEffect = new Audio(audio)
  soundEffect.play()
}

function gameOver(guardian, grid) {
  playAudio(soundGameOver)

  document.removeEventListener('keydown', e => 
    guardian.handleKeyInput(e, gameBoard.objectExist)
  )

  gameBoard.showGameStatus(gameWin)

  clearInterval(timer)

  startButton.classList.remove('hide')
}

function checkCollision(guardian, phantoms) {
  const collidedPhantom = phantoms.find(phantom => guardian.pos === phantom.pos)

  if(collidedPhantom) {
    if(guardian.powerPill) {
      playAudio(soundGhost)

      gameBoard.removeObject(collidedPhantom.pos, [
        OBJECT_TYPE.PHANTOM,
        OBJECT_TYPE.SCARED,
        collidedPhantom.name
      ])
      collidedPhantom.pos = collidedPhantom.startPos
      score += 420
    } else {
      gameBoard.removeObject(guardian.pos, [OBJECT_TYPE.GUARDIAN])
      gameBoard.rotateDiv(guardian.pos, 0)
      gameOver(guardian, gameGrid)
    }
  }
}

function gameLoop(guardian, phantoms) {
  gameBoard.moveCharacter(guardian)
  checkCollision(guardian, phantoms)

  phantoms.forEach(phantom => gameBoard.moveCharacter(phantom))
  checkCollision(guardian, phantoms)

  // Check if guardian eats a dot
  if(gameBoard.objectExist(guardian.pos, OBJECT_TYPE.DOT)) {
    playAudio(soundDot)

    gameBoard.removeObject(guardian.pos, [OBJECT_TYPE.DOT])
    gameBoard.dotCount--
    score += 1
  }

  // Check if guardian eats a powerpill
  if(gameBoard.objectExist(guardian.pos, OBJECT_TYPE.PILL)) {
    playAudio(soundPill)

    gameBoard.removeObject(guardian.pos, [OBJECT_TYPE.PILL])

    guardian.powerPill = true
    score += 69

    clearTimeout(powerPillTimer)

    powerPillTimer = setTimeout(
      () => (guardian.powerPill = false),
      POWER_PILL_TIME 
    )
  }

  // Change phantom scare mode depending on power pill consumption
  if(guardian.powerPill !== powerPillActive) {
    powerPillActive = guardian.powerPill
    phantoms.forEach((phantom) => (phantom.isScared = guardian.powerPill))
  }

  // Check if all dots have been eaten
  if(gameBoard.dotCount === 0) {
    gameWin = true
    gameOver(guardian, phantoms)
  }

  // Display score
  scoreTable.innerHTML = score

}

function startGame() {
  playAudio(soundGameStart)

  gameWin = false
  powerPillActive = false
  score = 0

  startButton.classList.add('hide')

  gameBoard.createGrid(LEVEL)

  const guardian = new Guardian(2, 287)
  gameBoard.addObject(287, [OBJECT_TYPE.GUARDIAN])
  document.addEventListener('keydown', (e) => 
    guardian.handleKeyInput(e, gameBoard.objectExist)
  )

  const phantoms = [
    new Phantom(5, 188, randomMovement, OBJECT_TYPE.REI),
    new Phantom(4, 209, randomMovement, OBJECT_TYPE.YURI),
    new Phantom(3, 230, randomMovement, OBJECT_TYPE.DEX),
    new Phantom(2, 251, randomMovement, OBJECT_TYPE.X4),
  ]

  timer = setInterval(() => gameLoop(guardian, phantoms), GLOBAL_SPEED)

}

// Initialize game
startButton.addEventListener('click', startGame)