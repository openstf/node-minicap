const INCOMPLETE = Symbol('incomplete')
const UNACCEPTABLE = Symbol('unacceptable')
const COMPLETE = Symbol('complete')

module.exports.INCOMPLETE = INCOMPLETE
module.exports.UNACCEPTABLE = UNACCEPTABLE
module.exports.COMPLETE = COMPLETE

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

module.exports.Result = Result
