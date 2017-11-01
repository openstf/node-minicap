const {
  QUIRK_DUMB,
  QUIRK_ALWAYS_UPRIGHT,
  QUIRK_TEAR
} = require('./quirks')

const Banner = require('./banner')
const BannerParser = require('./bannerparser')
const Packet = require('./packet')
const PacketParser = require('./packetparser')
const Parser = require('./parser')
const Result = require('./result')

module.exports.QUIRK_DUMB = QUIRK_DUMB
module.exports.QUIRK_ALWAYS_UPRIGHT = QUIRK_ALWAYS_UPRIGHT
module.exports.QUIRK_TEAR = QUIRK_TEAR

module.exports.Banner = Banner
module.exports.BannerParser = BannerParser
module.exports.Packet = Packet
module.exports.PacketParser = PacketParser
module.exports.Parser = Parser
module.exports.Result = Result
