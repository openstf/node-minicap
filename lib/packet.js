class Packet {
  constructor (id, type, data) {
    this.id = id
    this.type = type
    this.data = data
  }

  toProtocol () {
    // Use allocUnsafe since we know we're filling the whole buffer.
    const buffer = Buffer.allocUnsafe(4 + 4 + this.data.length)
    buffer.writeUInt32LE(this.data.length + 8, 0)
    buffer.writeUInt32LE(this.type, 4)
    this.data.copy(buffer, 8)
    return buffer
  }
}

Packet.HELO = 0x68656c6f // hello
Packet.MCH1 = 0x6d636831 // minicap header v1
Packet.MCJD = 0x6d636a64 // minicap jpeg data

module.exports = Packet
