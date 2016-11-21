class Banner {
  constructor (banner) {
    this.version = banner.version
    this.length = banner.length
    this.pid = banner.pid
    this.realWidth = banner.realWidth
    this.realHeight = banner.realHeight
    this.virtualWidth = banner.virtualWidth
    this.virtualHeight = banner.virtualHeight
    this.orientation = banner.orientation
    this.quirks = banner.quirks
  }

  toProtocol () {
    const buffer = Buffer.alloc(this.length)
    buffer[0] = this.version
    buffer[1] = this.length
    buffer.writeUInt32LE(this.pid, 2)
    buffer.writeUInt32LE(this.realWidth, 6)
    buffer.writeUInt32LE(this.realHeight, 10)
    buffer.writeUInt32LE(this.virtualWidth, 14)
    buffer.writeUInt32LE(this.virtualHeight, 18)
    buffer[22] = this.orientation / 90
    buffer[23] = this.quirks
    return buffer
  }
}

module.exports = Banner
