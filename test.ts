import 'mocha'
import assert = require('assert')
import IntervalTree from './index'



describe('interval tree', () => {
  it('simple', () => {
    const t = new IntervalTree

    const ints: [number, number][] = //[[0, 1]]
      [[1, 2], [-10, 10]]

    // debugger
    ints.forEach(i => t.addInterval(i))

    assert.deepStrictEqual([], Array.from(t.queryPoint(-15)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(-10)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(-5)))
    assert.deepStrictEqual([[-10, 10], [1, 2]], Array.from(t.queryPoint(1, true)))
    assert.deepStrictEqual([[-10, 10], [1, 2]], Array.from(t.queryPoint(1.5, true)))
    assert.deepStrictEqual([[-10, 10], [1, 2]], Array.from(t.queryPoint(2, true)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(3)))
    assert.deepStrictEqual([[-10, 10]], Array.from(t.queryPoint(10)))
    assert.deepStrictEqual([], Array.from(t.queryPoint(15, true)))
  })
})

    // console.log(Array.from(t.queryPoint(-5)))
    // console.log(Array.from(t.queryPoint(0.5)))
    // console.log(Array.from(t.queryPoint(1)))
    // console.log(Array.from(t.queryPoint(2)))
