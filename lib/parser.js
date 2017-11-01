const PacketParser = require('./packetparser')
const Result = require('./result')

const kPacketParser = Symbol('packetParser')
const kOnPacketAvailable = Symbol('onPacketAvailable')

class Parser {
  constructor ({onPacketAvailable}) {
    this[kPacketParser] = new PacketParser()
    this[kOnPacketAvailable] = onPacketAvailable
  }

  parse (chunk) {
    const packetParser = this[kPacketParser]
    do {
      const result = packetParser.parse(chunk)
      switch (result.state) {
        case Result.COMPLETE:
          this[kOnPacketAvailable](result.take())
          break
        case Result.UNACCEPTABLE:
          throw new Error('Unacceptable input data')
      }
      chunk = result.rest
    } while (chunk.length)
  }
}

module.exports = Parser
