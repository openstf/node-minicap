const assert = require('assert')

const Banner = require('../lib/banner')
const BannerParser = require('../lib/bannerparser')

function shouldParseValidBannerFromIdealChunk () {
  const parser = new BannerParser()
  const expected = new Banner({
    version: 1,
    length: 24,
    pid: 32038,
    realWidth: 1080,
    realHeight: 1920,
    virtualWidth: 720,
    virtualHeight: 1280,
    orientation: 90,
    quirks: 1 | 4
  })
  const result = parser.parse(expected.toProtocol())
  assert.equal(result.state, BannerParser.COMPLETE)
  assert.deepEqual(result.take(), expected)
  assert.equal(result.rest.length, 0)
}

shouldParseValidBannerFromIdealChunk()

function shouldParseValidBannerFromMultipleChunks () {
  const parser = new BannerParser()

  const expected = new Banner({
    version: 1,
    length: 24,
    pid: 32038,
    realWidth: 1080,
    realHeight: 1920,
    virtualWidth: 720,
    virtualHeight: 1280,
    orientation: 90,
    quirks: 1 | 4
  })

  const chunk = Buffer.concat([expected.toProtocol(), Buffer.alloc(4)])

  const result1 = parser.parse(chunk.slice(0, 10))
  assert.equal(result1.state, BannerParser.INCOMPLETE)
  assert.equal(result1.take(), null)
  assert.equal(result1.rest.length, 0)

  const result2 = parser.parse(chunk.slice(10, 20))
  assert.equal(result2.state, BannerParser.INCOMPLETE)
  assert.equal(result2.take(), null)
  assert.equal(result2.rest.length, 0)

  const result3 = parser.parse(chunk.slice(20))
  assert.equal(result3.state, BannerParser.COMPLETE)
  assert.deepEqual(result3.take(), expected)
  assert.equal(result3.rest.length, 4)
}

shouldParseValidBannerFromMultipleChunks()
