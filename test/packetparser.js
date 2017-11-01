const assert = require('assert')

const Packet = require('../lib/packet')
const PacketParser = require('../lib/packetparser')
const Result = require('../lib/result')

function shouldParseValidPacketFromIdealChunk () {
  const parser = new PacketParser()
  const expected = new Packet(0, Packet.HELO, Buffer.alloc(20).fill(0xFF))
  const result = parser.parse(expected.toProtocol())
  assert.equal(result.state, Result.COMPLETE)
  assert.deepEqual(result.take(), expected)
  assert.equal(result.rest.length, 0)
}

function shouldParsePacketWithNoData () {
  const parser = new PacketParser()
  const expected = new Packet(0, Packet.MCH1, Buffer.alloc(0))
  const result = parser.parse(expected.toProtocol())
  assert.equal(result.state, Result.COMPLETE)
  assert.deepEqual(result.take(), expected)
  assert.equal(result.rest.length, 0)
}

function shouldParseValidPacketFromMultipleChunks () {
  const parser = new PacketParser()
  const expected = new Packet(0, Packet.MCH1, Buffer.alloc(100).fill(0xFF))
  const chunk = Buffer.concat([expected.toProtocol(), Buffer.alloc(40)])

  const result1 = parser.parse(chunk.slice(0, 10))
  assert.equal(result1.state, Result.INCOMPLETE)
  assert.deepEqual(result1.take(), null)
  assert.equal(result1.rest.length, 0)

  const result2 = parser.parse(chunk.slice(10, 11))
  assert.equal(result2.state, Result.INCOMPLETE)
  assert.deepEqual(result2.take(), null)
  assert.equal(result2.rest.length, 0)

  const result3 = parser.parse(chunk.slice(11, 80))
  assert.equal(result3.state, Result.INCOMPLETE)
  assert.deepEqual(result3.take(), null)
  assert.equal(result3.rest.length, 0)

  const result4 = parser.parse(chunk.slice(80))
  assert.equal(result4.state, Result.COMPLETE)
  assert.deepEqual(result4.take(), expected)
  assert.equal(result4.rest.length, 40)
}

function shouldParseMultiplePacketsFromChunk () {
  const parser = new PacketParser()

  const expected1 = new Packet(0, Packet.MCH1, Buffer.alloc(100).fill(0x01))
  const expected2 = new Packet(1, Packet.MCJD, Buffer.alloc(5).fill(0x02))
  const expected3 = new Packet(2, Packet.MCH1, Buffer.alloc(18).fill(0x03))

  const chunk = Buffer.concat([
    expected1.toProtocol(),
    expected2.toProtocol(),
    expected3.toProtocol()
  ])

  const result1 = parser.parse(chunk)
  assert.equal(result1.state, Result.COMPLETE)
  assert.deepEqual(result1.take(), expected1)
  assert.equal(result1.rest.length, 8 + 5 + 8 + 18)

  const result2 = parser.parse(result1.rest)
  assert.equal(result2.state, Result.COMPLETE)
  assert.deepEqual(result2.take(), expected2)
  assert.equal(result2.rest.length, 8 + 18)

  const result3 = parser.parse(result2.rest)
  assert.equal(result3.state, Result.COMPLETE)
  assert.deepEqual(result3.take(), expected3)
  assert.equal(result3.rest.length, 0)
}

shouldParseValidPacketFromIdealChunk()
shouldParsePacketWithNoData()
shouldParseValidPacketFromMultipleChunks()
shouldParseMultiplePacketsFromChunk()
