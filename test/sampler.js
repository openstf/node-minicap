const assert = require('assert')

const Sampler = require('../lib/sampler')

function shouldDiscardOldSamples () {
  const sampler = new Sampler(3)
  sampler.push(1)
  assert.equal(sampler.count, 1)
  sampler.push(2)
  assert.equal(sampler.count, 2)
  sampler.push(3)
  assert.equal(sampler.head.item, 1)
  assert.equal(sampler.count, 3)
  sampler.push(4)
  assert.equal(sampler.head.item, 2)
  assert.equal(sampler.count, 3)
  sampler.push(5)
  assert.equal(sampler.head.item, 3)
  assert.equal(sampler.count, 3)
  sampler.push(6)
  assert.equal(sampler.head.item, 4)
  assert.equal(sampler.count, 3)
}

shouldDiscardOldSamples()
