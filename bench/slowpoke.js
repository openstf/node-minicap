const term = require('terminal-kit').terminal

const Sampler = require('../lib/sampler')

const KB = 1024

const kInterval = Symbol('interval')
const kTimer = Symbol('timer')
const kOnFrameRendered = Symbol('onFrameRendered')
const kOnFrameProduced = Symbol('onFrameProduced')
const kProducedFrameId = Symbol('producedFrameId')
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
    const frameId = this[kProducedFrameId] + 1
    this[kProducedFrameId] = frameId
    this[kProducedFrameSampler].push(1)
    this[kOnFrameProduced](frameId)
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

  onReceivedFrameFromServer (frameId) {
    this[kOnFrameRendered](frameId)
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
  term.red(server[kProducedFrameId] - server[kRenderedFrameId])(' frames behind')
  term.hideCursor()
}

const upstream = new LimitedBandwidthNetwork(200 * KB)
const downstream = new LimitedBandwidthNetwork(200 * KB)

const client = new FrameRenderingClient({
  onFrameRendered: (frameId) => {
    upstream.send(0.1 * KB, () => {
      server.onClientReportedFrameRendered(frameId)
    })
  }
})

const server = new FrameProducingServer({
  interval: 16,
  onFrameProduced: (frameId) => {
    downstream.send(20 * KB, () => {
      client.onReceivedFrameFromServer(frameId)
    })
  }
})

server.start()

setInterval(report, 500)
