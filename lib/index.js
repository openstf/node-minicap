const {
  QUIRK_DUMB,
  QUIRK_ALWAYS_UPRIGHT,
  QUIRK_TEAR
} = require('./quirks')

const Banner = require('./banner')
const BannerParser = require('./bannerparser')
const Frame = require('./frame')
const FrameParser = require('./frameparser')
const parse = require('./parse')

module.exports.QUIRK_DUMB = QUIRK_DUMB
module.exports.QUIRK_ALWAYS_UPRIGHT = QUIRK_ALWAYS_UPRIGHT
module.exports.QUIRK_TEAR = QUIRK_TEAR

module.exports.Banner = Banner
module.exports.BannerParser = BannerParser
module.exports.Frame = Frame
module.exports.FrameParser = FrameParser
module.exports.parse = parse
