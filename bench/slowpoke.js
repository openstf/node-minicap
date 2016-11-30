const term = require('terminal-kit').terminal

const Sampler = require('../lib/sampler')
const Frame = require('../lib/frame')
const Transmitter = require('../lib/transmitter')

const KB = 1024

const kInterval = Symbol('interval')
const kTimer = Symbol('timer')
const kOnFrameRendered = Symbol('onFrameRendered')
const kOnFrameProduced = Symbol('onFrameProduced')
const kProducedFrameId = Symbol('producedFrame')
const kProducedFrame = Symbol('producedFrameId')
const kRenderedFrameId = Symbol('renderedFrameId')
const kBytesPerSecond = Symbol('bytesPerSecond')
const kQueue = Symbol('queue')
const kProducedFrameSampler = Symbol('producedFrameSampler')
const kRenderedFrameSampler = Symbol('renderedFrameSampler')

class FrameProducingServer {
  constructor ({interval, onFrameProduced}) {
    this[kInterval] = interval
    this[kTimer] = null
    this[kOnFrameProduced] = onFrameProduced
    this[kProducedFrame] = null
    this[kProducedFrameId] = 0
    this[kRenderedFrameId] = 0
    this[kProducedFrameSampler] = new Sampler(60)
    this[kRenderedFrameSampler] = new Sampler(60)
  }

  onClientReportedFrameRendered (frameId) {
    this[kRenderedFrameId] = frameId
    this[kRenderedFrameSampler].push(1)
  }

  produceFrame () {
    const frame = new Frame(this[kProducedFrameId] + 1, null)
    this[kProducedFrame] = frame
    this[kProducedFrameId] = frame.id
    this[kProducedFrameSampler].push(1)
    this[kOnFrameProduced](frame)
  }

  start () {
    this[kTimer] = setInterval(() => this.produceFrame(), this[kInterval])
  }

  stop () {
    clearInterval(this[kTimer])
  }
}

class FrameRenderingClient {
  constructor ({onFrameRendered}) {
    this[kOnFrameRendered] = onFrameRendered
  }

  onReceivedFrameFromServer (frame) {
    this[kOnFrameRendered](frame)
  }
}

class LimitedBandwidthNetwork {
  constructor (bytesPerSecond) {
    this[kBytesPerSecond] = bytesPerSecond
    this[kQueue] = []
    this[kTimer] = null
  }

  send (size, message) {
    this[kQueue].push({ size, message })
    this.next()
  }

  next () {
    if (this[kTimer]) {
      return
    }

    const payload = this[kQueue].shift()

    if (!payload) {
      return
    }

    const timeToSend = payload.size / this[kBytesPerSecond] * 1000

    this[kTimer] = setTimeout(() => {
      payload.message()
      this[kTimer] = null
      this.next()
    }, timeToSend)
  }

  queue (size, message) {
    this[kQueue].push({ size, message })
  }
}

function report () {
  term.clear()
  term.moveTo(1, 1)
  const producedFps = server[kProducedFrameSampler].samplesPerInterval(1000)
  const renderedFps = server[kRenderedFrameSampler].samplesPerInterval(1000)
  term.cyan(producedFps.toFixed(2))(' frames produced per second')
  term.moveTo(1, 2)
  term.cyan(renderedFps.toFixed(2))(' frames rendered per second')
  term.moveTo(1, 3)
  term.cyan(server[kProducedFrameId])(' latest produced frame')
  term.moveTo(1, 4)
  term.cyan(server[kRenderedFrameId])(' latest rendered frame')
  term.moveTo(1, 5)
  term.red(transmitter.howMuchBehind())(' frames behind')
  term.moveTo(1, 6)
  term.red(transmitter.shouldThrottleMore() ? 'YES' : 'NO')(' should throttle more')
  term.hideCursor()
}

const upstream = new LimitedBandwidthNetwork(200 * KB)
const downstream = new LimitedBandwidthNetwork(200 * KB)

const client = new FrameRenderingClient({
  onFrameRendered: (frame) => {
    upstream.send(0.1 * KB, () => {
      transmitter.markReceived(frame.id)
    })
  }
})

const server = new FrameProducingServer({
  interval: 16,
  onFrameProduced: (frame) => {
    transmitter.push(frame)
  }
})

const transmitter = new Transmitter({
  onFrameReady: (frame) => {
    downstream.send(20 * KB, () => {
      client.onReceivedFrameFromServer(frame)
    })
  }
})

server.start()

setInterval(report, 500)
