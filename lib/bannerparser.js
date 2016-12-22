const Banner = require('./banner')
const Result = require('./result')

const kParser = Symbol('parser')
const kState = Symbol('state')
const kResult = Symbol('result')
const kVersion = Symbol('version')
const kLength = Symbol('length')
const kPid = Symbol('pid')
const kRealWidth = Symbol('realWidth')
const kRealHeight = Symbol('realHeight')
const kVirtualWidth = Symbol('virtualWidth')
const kVirtualHeight = Symbol('virtualHeight')
const kOrientation = Symbol('orientation')
const kQuirks = Symbol('quirks')

const {
  INCOMPLETE,
  UNACCEPTABLE,
  COMPLETE
} = Result

class BannerParser {
  constructor () {
    this[kVersion] = 0
    this[kLength] = 0
    this[kPid] = 0
    this[kRealWidth] = 0
    this[kRealHeight] = 0
    this[kVirtualWidth] = 0
    this[kVirtualHeight] = 0
    this[kOrientation] = 0
    this[kQuirks] = 0
    this[kParser] = this.parseVersion0
    this[kState] = INCOMPLETE
    this[kResult] = new Result()
  }

  take () {
    const banner = new Banner({
      version: this[kVersion],
      length: this[kLength],
      pid: this[kPid],
      realWidth: this[kRealWidth],
      realHeight: this[kRealHeight],
      virtualWidth: this[kVirtualWidth],
      virtualHeight: this[kVirtualHeight],
      orientation: this[kOrientation],
      quirks: this[kQuirks]
    })

    return banner
  }

  parseVersion0 (chunk) {
    const byte = chunk[0]
    this[kVersion] = byte
    this[kParser] = this.parseLength0
    this[kState] = INCOMPLETE
    return 1
  }

  parseLength0 (chunk) {
    const byte = chunk[0]
    this[kLength] = byte
    this[kParser] = this.parsePid0
    this[kState] = INCOMPLETE
    return 1
  }

  parsePid0 (chunk) {
    const byte = chunk[0]
    this[kPid] = 0
    this[kPid] += (byte << (0 * 8)) >>> 0
    this[kParser] = this.parsePid1
    this[kState] = INCOMPLETE
    return 1
  }

  parsePid1 (chunk) {
    const byte = chunk[0]
    this[kPid] += (byte << (1 * 8)) >>> 0
    this[kParser] = this.parsePid2
    this[kState] = INCOMPLETE
    return 1
  }

  parsePid2 (chunk) {
    const byte = chunk[0]
    this[kPid] += (byte << (2 * 8)) >>> 0
    this[kParser] = this.parsePid3
    this[kState] = INCOMPLETE
    return 1
  }

  parsePid3 (chunk) {
    const byte = chunk[0]
    this[kPid] += (byte << (3 * 8)) >>> 0
    this[kParser] = this.parseRealWidth0
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealWidth0 (chunk) {
    const byte = chunk[0]
    this[kRealWidth] = 0
    this[kRealWidth] += (byte << (0 * 8)) >>> 0
    this[kParser] = this.parseRealWidth1
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealWidth1 (chunk) {
    const byte = chunk[0]
    this[kRealWidth] += (byte << (1 * 8)) >>> 0
    this[kParser] = this.parseRealWidth2
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealWidth2 (chunk) {
    const byte = chunk[0]
    this[kRealWidth] += (byte << (2 * 8)) >>> 0
    this[kParser] = this.parseRealWidth3
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealWidth3 (chunk) {
    const byte = chunk[0]
    this[kRealWidth] += (byte << (3 * 8)) >>> 0
    this[kParser] = this.parseRealHeight0
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealHeight0 (chunk) {
    const byte = chunk[0]
    this[kRealHeight] = 0
    this[kRealHeight] += (byte << (0 * 8)) >>> 0
    this[kParser] = this.parseRealHeight1
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealHeight1 (chunk) {
    const byte = chunk[0]
    this[kRealHeight] += (byte << (1 * 8)) >>> 0
    this[kParser] = this.parseRealHeight2
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealHeight2 (chunk) {
    const byte = chunk[0]
    this[kRealHeight] += (byte << (2 * 8)) >>> 0
    this[kParser] = this.parseRealHeight3
    this[kState] = INCOMPLETE
    return 1
  }

  parseRealHeight3 (chunk) {
    const byte = chunk[0]
    this[kRealHeight] += (byte << (3 * 8)) >>> 0
    this[kParser] = this.parseVirtualWidth0
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualWidth0 (chunk) {
    const byte = chunk[0]
    this[kVirtualWidth] = 0
    this[kVirtualWidth] += (byte << (0 * 8)) >>> 0
    this[kParser] = this.parseVirtualWidth1
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualWidth1 (chunk) {
    const byte = chunk[0]
    this[kVirtualWidth] += (byte << (1 * 8)) >>> 0
    this[kParser] = this.parseVirtualWidth2
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualWidth2 (chunk) {
    const byte = chunk[0]
    this[kVirtualWidth] += (byte << (2 * 8)) >>> 0
    this[kParser] = this.parseVirtualWidth3
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualWidth3 (chunk) {
    const byte = chunk[0]
    this[kVirtualWidth] += (byte << (3 * 8)) >>> 0
    this[kParser] = this.parseVirtualHeight0
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualHeight0 (chunk) {
    const byte = chunk[0]
    this[kVirtualHeight] = 0
    this[kVirtualHeight] += (byte << (0 * 8)) >>> 0
    this[kParser] = this.parseVirtualHeight1
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualHeight1 (chunk) {
    const byte = chunk[0]
    this[kVirtualHeight] += (byte << (1 * 8)) >>> 0
    this[kParser] = this.parseVirtualHeight2
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualHeight2 (chunk) {
    const byte = chunk[0]
    this[kVirtualHeight] += (byte << (2 * 8)) >>> 0
    this[kParser] = this.parseVirtualHeight3
    this[kState] = INCOMPLETE
    return 1
  }

  parseVirtualHeight3 (chunk) {
    const byte = chunk[0]
    this[kVirtualHeight] += (byte << (3 * 8)) >>> 0
    this[kParser] = this.parseOrientation0
    this[kState] = INCOMPLETE
    return 1
  }

  parseOrientation0 (chunk) {
    const byte = chunk[0]
    this[kOrientation] = byte * 90
    this[kParser] = this.parseQuirks0
    this[kState] = INCOMPLETE
    return 1
  }

  parseQuirks0 (chunk) {
    const byte = chunk[0]
    this[kQuirks] = byte
    this[kParser] = this.parseVersion0
    this[kState] = COMPLETE
    return 1
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

BannerParser.INCOMPLETE = INCOMPLETE
BannerParser.UNACCEPTABLE = UNACCEPTABLE
BannerParser.COMPLETE = COMPLETE

module.exports = BannerParser
