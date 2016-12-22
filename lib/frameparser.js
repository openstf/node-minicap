const Frame = require('./frame')
const Result = require('./result')

const kParser = Symbol('parser')
const kState = Symbol('state')
const kResult = Symbol('result')
const kChunks = Symbol('chunks')
const kLength = Symbol('length')
const kRead = Symbol('read')
const kNextId = Symbol('nextId')

const {
  INCOMPLETE,
  UNACCEPTABLE,
  COMPLETE
} = Result

class FrameParser {
  constructor () {
    this[kChunks] = []
    this[kLength] = 0
    this[kRead] = 0
    this[kNextId] = 0
    this[kParser] = this.parseLength0
    this[kState] = INCOMPLETE
    this[kResult] = new Result()
  }

  take () {
    const buffer = Buffer.concat(this[kChunks], this[kLength])
    const id = this[kNextId]
    this[kNextId] += 1
    this[kChunks] = []
    return new Frame(id, buffer)
  }

  parseLength0 (chunk) {
    this[kRead] = 0
    // Optimization for when the length is in a single chunk.
    if (chunk.length >= 4) {
      this[kLength] = chunk.readUInt32LE(0)
      this[kParser] = this.parseFrame
      this[kState] = INCOMPLETE
      return 4
    }
    const byte = chunk[0]
    this[kLength] = (byte << (0 * 8)) >>> 0
    this[kParser] = this.parseLength1
    this[kState] = INCOMPLETE
    return 1
  }

  parseLength1 (chunk) {
    const byte = chunk[0]
    this[kLength] += (byte << (1 * 8)) >>> 0
    this[kParser] = this.parseLength2
    this[kState] = INCOMPLETE
    return 1
  }

  parseLength2 (chunk) {
    const byte = chunk[0]
    this[kLength] += (byte << (2 * 8)) >>> 0
    this[kParser] = this.parseLength3
    this[kState] = INCOMPLETE
    return 1
  }

  parseLength3 (chunk) {
    const byte = chunk[0]
    this[kLength] += (byte << (3 * 8)) >>> 0
    this[kParser] = this.parseFrame
    this[kState] = INCOMPLETE
    return 1
  }

  parseFrame (chunk) {
    const recv = chunk.length
    const need = this[kLength] - this[kRead]

    if (recv >= need) {
      this[kChunks].push(chunk.slice(0, need))
      this[kParser] = this.parseLength0
      this[kState] = COMPLETE
      this[kRead] += need
      return need
    }

    this[kChunks].push(chunk)
    this[kState] = INCOMPLETE
    this[kRead] += recv
    return recv
  }

  parse (chunk) {
    for (let i = 0; i < chunk.length;) {
      i += this[kParser](chunk.slice(i))
      switch (this[kState]) {
        case INCOMPLETE:
          break
        case COMPLETE:
          return this[kResult].update(this[kState], this.take(), chunk.slice(i))
        case UNACCEPTABLE:
          return this[kResult].update(this[kState], null, chunk.slice(i))
      }
    }
    return this[kResult].update(this[kState], null, chunk.slice(chunk.length))
  }
}

FrameParser.INCOMPLETE = INCOMPLETE
FrameParser.UNACCEPTABLE = UNACCEPTABLE
FrameParser.COMPLETE = COMPLETE

module.exports = FrameParser
