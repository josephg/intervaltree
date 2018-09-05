import 'mocha'
import assert = require('assert')
import IntervalTree, {Interval} from './index'

const sortCmp = (a: Interval, b: Interval) => (a[0] - b[0]) || (a[1] - b[1])

// This is a spec-compatible reimplementation with a naive implementation of
// the class. Its used to verify the code is correct.
class NaiveMock {
  entries: Interval[]
  constructor() {
    this.entries = []
  }

  addInterval(a: number, b: number, data?: any) {
    this.entries.push(data === undefined ? [a, b] : [a, b, data])
  }

  *queryPoint(p: number, sort: boolean = false) {
    const results: Interval[] = []
    this.entries.forEach(i => {
      if (p >= i[0] && p < i[1]) results.push(i)
    })
    yield *results.sort(sortCmp)
  }

  widen(p: number, amt: number = 1, extendEndEq = true) {
    assert(amt >= 0)
    this.entries.forEach(i => {
      if (i[0] >= p) i[0] += amt
      if (i[1] > p || (extendEndEq && i[1] === p)) i[1] += amt
    })
  }
  shrink(p: number, amt: number = 1) {
    assert(amt >= 0)
    this.entries.forEach(i => {
      if (i[0] >= p) i[0] = Math.max(i[0] - amt, p)
      if (i[1] >= p) i[1] = Math.max(i[1] - amt, p)
    })
  }
}

class BothMock {
  mock: NaiveMock
  real: IntervalTree
  constructor() {
    this.mock = new NaiveMock
    this.real = new IntervalTree
  }

  addInterval(a: number, b: number, data?: any) {
    this.mock.addInterval(a, b, data)
    this.real.addInterval(a, b, data)
  }

  *queryPoint(p: number, sort: boolean = false) {
    const m = Array.from(this.mock.queryPoint(p, sort))
    const r = Array.from(this.real.queryPoint(p, sort))

    if (!sort) { m.sort(sortCmp); r.sort(sortCmp) }
    // console.log('m,r', m, r)
    assert.deepStrictEqual(m, r, 'Real and mock results don\'t match')
    yield *m
  }
}

describe('interval tree', () => {
  it('simple', () => {
    const t = new BothMock

    const ints: [number, number][] = //[[0, 1]]
      [[1, 2], [-10, 10]]

    // debugger
    ints.forEach(([a, b]) => t.addInterval(a, b))

    assert.deepStrictEqual([], Array.from(t.queryPoint(-15)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(-10)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(-5)))
    assert.deepStrictEqual([[-10, 10], [1, 2]], Array.from(t.queryPoint(1, true)))
    assert.deepStrictEqual([[-10, 10], [1, 2]], Array.from(t.queryPoint(1.5, true)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(2, true)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(3)))
    assert.deepStrictEqual([], Array.from(t.queryPoint(10)))
    assert.deepStrictEqual([], Array.from(t.queryPoint(15, true)))
  })
})

    // console.log(Array.from(t.queryPoint(-5)))
    // console.log(Array.from(t.queryPoint(0.5)))
    // console.log(Array.from(t.queryPoint(1)))
    // console.log(Array.from(t.queryPoint(2)))
