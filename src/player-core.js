import Terminal from '../libs/xterm.js'
import { assign } from './utils'
const EventEmitter = Terminal.EventEmitter
const inherits = Terminal.inherits

const defaultCols = 80
const defaultRows = 30

export default function TermPlayer(options) {
  EventEmitter.call(this)

  const term = new Terminal(options)
  term.open()

  this.term = term
}

inherits(TermPlayer, EventEmitter)

assign(TermPlayer.prototype, {

  speed: 1,

  repeat: true,

  interval: 3000,

  atEnd() {
    return this.step === this.frames.length
  },

  play(frames) {
    if (frames) {
      this.frames = frames
    }
    this.term.reset()
    this.step = 0
    this.renderFrame()
    this.emit('play')
  },

  pause() {
    clearTimeout(this._nextTimer)
    this.emit('pause')
  },

  resume() {
    if (this.atEnd()) {
      this.play()
    } else {
      this.renderFrame()
    }
    this.emit('play')
  },

  renderFrame() {
    const step = this.step
    const frames = this.frames
    const currentFrame = frames[step]
    const nextFrame = frames[step + 1]
    const str = currentFrame.content
    this.term.write(str)
    this.step = step + 1

    this.next(currentFrame, nextFrame)
  },

  next(currentFrame, nextFrame) {
    if (nextFrame) {
      this._nextTimer = setTimeout(
        _ => this.renderFrame(),
        (nextFrame.time - currentFrame.time) / this.speed
      )
    } else if (this.repeat) {
      this._nextTimer = setTimeout(_ => this.play(), this.interval)
    } else {
      this.emit('end')
    }
  }
})