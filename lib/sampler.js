class Sample {
  constructor (item, time = Date.now()) {
    this.time = time
    this.item = item
    this.next = null
  }
}

class Sampler {
  constructor (limit) {
    this.head = null
    this.tail = null
    this.count = 0
    this.limit = limit
  }

  push (item) {
    const sample = new Sample(item, Date.now())

    if (!this.head) {
      this.head = sample
      this.tail = sample
      this.count += 1
      return
    }

    while (this.count >= this.limit) {
      if (this.head === this.tail) {
        this.head = this.tail = this.head.next
      } else {
        this.head = this.head.next
      }
      this.count -= 1
    }

    this.tail.next = sample
    this.tail = sample
    this.count += 1
  }

  samplesPerInterval (ms) {
    if (!this.head) {
      return 0
    }

    const a = this.head.time
    const b = this.tail.time

    if (a === b) {
      return 0
    }

    return this.count * (ms / (b - a))
  }

  isDecreasingInValue () {
    if (this.count < this.limit) {
      return false
    }

    let prev = this.head
    let item = prev.next

    while (item) {
      if (item.value >= prev.value) {
        return false
      }

      prev = item
      item = prev.next
    }

    return true
  }
}

module.exports = Sampler
