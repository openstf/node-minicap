const Packet = require('./packet')
const Result = require('./result')

const kParser = Symbol('parser')
const kState = Symbol('state')
const kResult = Symbol('result')
const kChunks = Symbol('chunks')
const kLength = Symbol('length')
const kType = Symbol('type')
const kRead = Symbol('read')
const kNextId = Symbol('nextId')

const {
  INCOMPLETE,
  UNACCEPTABLE,
  COMPLETE
} = Result

class PacketParser {
  constructor () {
    this[kChunks] = []
    this[kLength] = 0
    this[kType] = 0
    this[kRead] = 0
    this[kNextId] = 0
    this[kParser] = this.parseLength0
    this[kState] = INCOMPLETE
    this[kResult] = new Result()
  }

  take () {
    const buffer = Buffer.concat(this[kChunks], this[kLength] - 8)
    const type = this[kType]
    const id = this[kNextId]
    this[kNextId] += 1
    this[kChunks] = []
    return new Packet(id, type, buffer)
  }

  parseLength0 (chunk) {
    // Optimization for when the length is in a single chunk.
    if (chunk.length >= 4) {
      this[kLength] = chunk.readUInt32LE(0)
      this[kParser] = this.parseType0
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
    this[kParser] = this.parseType0
    this[kState] = INCOMPLETE
    return 1
  }

  parseType0 (chunk) {
    // Optimization for when the type is in a single chunk.
    if (chunk.length >= 4) {
      this[kType] = chunk.readUInt32LE(0)
      this[kParser] = this.parseData
      this[kState] = this[kLength] === 8 ? COMPLETE : INCOMPLETE
      return 4
    }
    const byte = chunk[0]
    this[kType] = (byte << (0 * 8)) >>> 0
    this[kParser] = this.parseType1
    this[kState] = INCOMPLETE
    return 1
  }

  parseType1 (chunk) {
    const byte = chunk[0]
    this[kType] += (byte << (1 * 8)) >>> 0
    this[kParser] = this.parseType2
    this[kState] = INCOMPLETE
    return 1
  }

  parseType2 (chunk) {
    const byte = chunk[0]
    this[kType] += (byte << (2 * 8)) >>> 0
    this[kParser] = this.parseType3
    this[kState] = INCOMPLETE
    return 1
  }

  parseType3 (chunk) {
    const byte = chunk[0]
    this[kType] += (byte << (3 * 8)) >>> 0
    this[kParser] = this.parseData
    this[kState] = this[kLength] === 8 ? COMPLETE : INCOMPLETE
    return 1
  }

  parseData (chunk) {
    const recv = chunk.length
    const need = this[kLength] - 8 - this[kRead]

    if (need < 0) {
      this[kState] = UNACCEPTABLE
      return 0
    }

    if (recv >= need) {
      this[kChunks].push(chunk.slice(0, need))
      this[kParser] = this.parseLength0
      this[kState] = COMPLETE
      this[kRead] = 0
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

module.exports = PacketParser
