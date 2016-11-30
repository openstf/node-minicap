class Frame {
  constructor (id, buffer) {
    this.id = id
    this.buffer = buffer
  }

  toProtocol () {
    // Use allocUnsafe since we know we're filling the whole buffer.
    const buffer = Buffer.allocUnsafe(4 + this.buffer.length)
    buffer.writeUInt32LE(this.buffer.length, 0)
    this.buffer.copy(buffer, 4)
    return buffer
  }
}

module.exports = Frame
