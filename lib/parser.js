const BannerParser = require('./bannerparser')
const FrameParser = require('./frameparser')

const kFrameParser = Symbol('frameParser')
const kOnFrameAvailable = Symbol('onFrameAvailable')
const kBannerParsed = Symbol('bannerParsed')
const kBannerParser = Symbol('bannerParser')
const kOnBannerAvailable = Symbol('onBannerAvailable')

class Parser {
  constructor ({onBannerAvailable, onFrameAvailable}) {
    this[kFrameParser] = new FrameParser()
    this[kOnFrameAvailable] = onFrameAvailable
    this[kBannerParsed] = false
    this[kBannerParser] = new BannerParser()
    this[kOnBannerAvailable] = onBannerAvailable
  }

  parse (chunk) {
    const bannerParser = this[kBannerParser]
    const frameParser = this[kFrameParser]
    do {
      if (!this[kBannerParsed]) {
        const result = bannerParser.parse(chunk)
        if (result.state === BannerParser.COMPLETE) {
          this[kBannerParsed] = true
          this[kOnBannerAvailable](result.take())
        }
        chunk = result.rest
      } else {
        const result = frameParser.parse(chunk)
        if (result.state === FrameParser.COMPLETE) {
          this[kOnFrameAvailable](result.take())
        }
        chunk = result.rest
      }
    } while (chunk.length)
  }
}

module.exports = Parser
