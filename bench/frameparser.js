const assert = require('assert')

const {Frame, FrameParser} = require('../')

const KB = 1024
const MB = KB * 1024

function produceFakeFrameChunks (frameCount, chunkSize) {
  const chunks = []
  let totalSize = 0

  assert.equal(frameCount % 5, 0, 'Frame count must be divisible by 5')

  const generateFrame = (size, fill) => {
    const idealChunk = new Frame(Buffer.alloc(size, fill)).toProtocol()
    for (let i = 0; i < idealChunk.length;) {
      const usualChunk = idealChunk.slice(i, i + chunkSize)
      chunks.push(usualChunk)
      i += usualChunk.length
    }
    totalSize += size
  }

  for (let i = 0, l = frameCount / 5; i < l; ++i) {
    generateFrame(501 * KB, 0x01)
    generateFrame(485 * KB, 0x02)
    generateFrame(522 * KB, 0x03)
    generateFrame(686 * KB, 0x04)
    generateFrame(168 * KB, 0x05)
  }

  return {
    chunks,
    totalSize
  }
}

function parse (chunks) {
  const parser = new FrameParser()
  let chunk, result
  let count = 0
  for (let i = 0, l = chunks.length; i < l; ++i) {
    do {
      chunk = chunks[i]
      result = parser.parse(chunk)
      if (result.state === FrameParser.COMPLETE) {
        count += 1
      }
      chunk = result.rest
    } while (chunk.length)
  }
  return count
}

const wantedFrameCount = process.env.FRAMES || 1000
const chunkSize = process.env.CHUNKSIZE || 1440

console.error(`Allocating ${wantedFrameCount} fake frames...`)
const {chunks, totalSize} = produceFakeFrameChunks(wantedFrameCount, chunkSize)

console.error(`Allocated ${chunks.length} chunks totaling ${totalSize / MB}MB`)
console.error('Parsing chunks...')

const startTime = Date.now()
const parsedFrameCount = parse(chunks)
const endTime = Date.now()
const elapsedTime = endTime - startTime

console.error(
  'Parsed %d frames in %ds (%dMB/s)',
  parsedFrameCount,
  elapsedTime / 1000,
  (totalSize / MB) / (elapsedTime / 1000)
)

assert.equal(wantedFrameCount, parsedFrameCount)
