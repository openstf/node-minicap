const Sampler = require('./sampler')

const kLatestProducedFrame = Symbol('latestProducedFrame')
const kRenderBehindProduction = Symbol('renderBehindProduction')
const kLastTransmittedFrameId = Symbol('lastTransmittedFrameId')
const kLastReceivedFrameId = Symbol('lastReceivedFrameId')
const kOnFrameReady = Symbol('onFrameReady')

class Transmitter {
  constructor ({onFrameReady}) {
    this[kLatestProducedFrame] = null
    this[kRenderBehindProduction] = new Sampler(3)
    this[kLastTransmittedFrameId] = 0
    this[kLastReceivedFrameId] = 0
    this[kOnFrameReady] = onFrameReady
  }

  markReceived (frameId) {
    const diff = this[kLastTransmittedFrameId] - this[kLastReceivedFrameId]
    this[kLastReceivedFrameId] = frameId
    this[kRenderBehindProduction].push(diff)
  }

  shouldThrottleMore () {
    return this[kRenderBehindProduction].isDecreasingInValue()
  }

  howMuchBehind () {
    return this[kLastTransmittedFrameId] - this[kLastReceivedFrameId]
  }

  transmit () {
    const frame = this[kLatestProducedFrame]
    if (!frame) {
      return
    }
    this[kLastTransmittedFrameId] = frame.id
    this[kOnFrameReady](frame)
  }

  push (frame) {
    this[kLatestProducedFrame] = frame
    this.transmit() //
  }
}

module.exports = Transmitter
