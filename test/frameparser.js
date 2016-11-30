const assert = require('assert')

const {
  INCOMPLETE,
  COMPLETE
} = require('../lib/parse')

const Frame = require('../lib/frame')
const FrameParser = require('../lib/frameparser')

function shouldParseValidFrameFromIdealChunk () {
  const parser = new FrameParser()
  const expected = new Frame(0, Buffer.alloc(100).fill(0xFF))
  const result = parser.parse(expected.toProtocol())
  assert.equal(result.state, COMPLETE)
  assert.deepEqual(result.take(), expected)
  assert.equal(result.rest.length, 0)
}

function shouldParseValidFrameFromMultipleChunks () {
  const parser = new FrameParser()
  const expected = new Frame(0, Buffer.alloc(100).fill(0xFF))
  const chunk = Buffer.concat([expected.toProtocol(), Buffer.alloc(40)])

  const result1 = parser.parse(chunk.slice(0, 10))
  assert.equal(result1.state, INCOMPLETE)
  assert.deepEqual(result1.take(), null)
  assert.equal(result1.rest.length, 0)

  const result2 = parser.parse(chunk.slice(10, 11))
  assert.equal(result2.state, INCOMPLETE)
  assert.deepEqual(result2.take(), null)
  assert.equal(result2.rest.length, 0)

  const result3 = parser.parse(chunk.slice(11, 80))
  assert.equal(result3.state, INCOMPLETE)
  assert.deepEqual(result3.take(), null)
  assert.equal(result3.rest.length, 0)

  const result4 = parser.parse(chunk.slice(80))
  assert.equal(result4.state, COMPLETE)
  assert.deepEqual(result4.take(), expected)
  assert.equal(result4.rest.length, 40)
}

function shouldParseMultipleFramesFromChunk () {
  const parser = new FrameParser()

  const expected1 = new Frame(0, Buffer.alloc(100).fill(0x01))
  const expected2 = new Frame(1, Buffer.alloc(5).fill(0x02))
  const expected3 = new Frame(2, Buffer.alloc(18).fill(0x03))

  const chunk = Buffer.concat([
    expected1.toProtocol(),
    expected2.toProtocol(),
    expected3.toProtocol()
  ])

  const result1 = parser.parse(chunk)
  assert.equal(result1.state, COMPLETE)
  assert.deepEqual(result1.take(), expected1)
  assert.equal(result1.rest.length, 4 + 4 + 23)

  const result2 = parser.parse(result1.rest)
  assert.equal(result2.state, COMPLETE)
  assert.deepEqual(result2.take(), expected2)
  assert.equal(result2.rest.length, 4 + 18)

  const result3 = parser.parse(result2.rest)
  assert.equal(result3.state, COMPLETE)
  assert.deepEqual(result3.take(), expected3)
  assert.equal(result3.rest.length, 0)
}

shouldParseValidFrameFromIdealChunk()
shouldParseValidFrameFromMultipleChunks()
shouldParseMultipleFramesFromChunk()
