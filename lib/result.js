const INCOMPLETE = Symbol('incomplete')
const UNACCEPTABLE = Symbol('unacceptable')
const COMPLETE = Symbol('complete')

const kResult = Symbol('result')

class Result {
  constructor () {
    this.state = INCOMPLETE
    this.rest = null
    this[kResult] = null
  }

  is (state) {
    return state === this.state
  }

  take () {
    const result = this[kResult]
    this[kResult] = null
    return result
  }

  update (state, result, rest) {
    this.state = state
    this.rest = rest
    this[kResult] = result
    return this
  }
}

Result.INCOMPLETE = INCOMPLETE
Result.UNACCEPTABLE = UNACCEPTABLE
Result.COMPLETE = COMPLETE

module.exports = Result
