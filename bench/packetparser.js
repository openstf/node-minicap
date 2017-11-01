const assert = require('assert')

const {Packet, PacketParser, Result} = require('../')

const KB = 1024
const MB = KB * 1024

function produceFakePacketChunks (packetCount, chunkSize) {
  const chunks = []
  let totalSize = 0

  assert.equal(packetCount % 5, 0, 'Packet count must be divisible by 5')

  const generatePacket = (id, size, fill) => {
    const idealChunk = new Packet(id, Packet.MCJD, Buffer.alloc(size, fill)).toProtocol()
    for (let i = 0; i < idealChunk.length;) {
      const usualChunk = idealChunk.slice(i, i + chunkSize)
      chunks.push(usualChunk)
      i += usualChunk.length
    }
    totalSize += size
  }

  for (let i = 0, l = packetCount / 5; i < l; ++i) {
    generatePacket(i * 5 + 1, 501 * KB, 0x01)
    generatePacket(i * 5 + 2, 485 * KB, 0x02)
    generatePacket(i * 5 + 3, 522 * KB, 0x03)
    generatePacket(i * 5 + 4, 686 * KB, 0x04)
    generatePacket(i * 5 + 5, 168 * KB, 0x05)
  }

  return {
    chunks,
    totalSize
  }
}

function parse (chunks) {
  const parser = new PacketParser()
  let chunk, result
  let count = 0
  for (let i = 0, l = chunks.length; i < l; ++i) {
    do {
      chunk = chunks[i]
      result = parser.parse(chunk)
      if (result.state === Result.COMPLETE) {
        count += 1
      }
      chunk = result.rest
    } while (chunk.length)
  }
  return count
}

const wantedPacketCount = process.env.PACKETS || 1000
const chunkSize = process.env.CHUNKSIZE || 1440

console.error(`Allocating ${wantedPacketCount} fake packets...`)
const {chunks, totalSize} = produceFakePacketChunks(wantedPacketCount, chunkSize)

console.error(`Allocated ${chunks.length} chunks totaling ${totalSize / MB}MB`)
console.error('Parsing chunks...')

const startTime = Date.now()
const parsedPacketCount = parse(chunks)
const endTime = Date.now()
const elapsedTime = endTime - startTime

console.error(
  'Parsed %d packets in %ds (%dMB/s)',
  parsedPacketCount,
  elapsedTime / 1000,
  (totalSize / MB) / (elapsedTime / 1000)
)

assert.equal(wantedPacketCount, parsedPacketCount)
