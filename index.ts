import bs = require('binary-search')
import assert = require('assert')

const abs = (x: number) => x < 0 ? -x : x

export type Interval = [number, number] | [number, number, any]
// const cmp = (a: number, b: number) => a - b
const cmpFirst = (a: Interval, b: number) => (a[0] - b) || (a[1] - b)
const cmpSecond = (a: Interval, b: number) => (a[1] - b) || (a[0] - b)

const sortCmp = (a: Interval, b: Interval) => (a[0] - b[0]) || (a[1] - b[1])

const centre = (i: Interval) => Number.isInteger(i[0])
  ? Math.floor((i[0] + i[1])/2)
  : ((i[0] + i[1])/2)

// This is a helper function to avoid repeated code below. Note we're using a
// simple binary search-sorted list for this. Moving to a tree for this local
// list would improve insert & remove performance when lots of intervals
// overlap; but I'm not optimizing for that use case here.
const insertLocals = (i: Interval, into: Interval[], isFirst: boolean) => {
  // debugger
  const [a, b] = i
  const idx = isFirst ? bs(into, a, cmpFirst) : bs(into, b, cmpSecond)

  if (idx < -into.length) into.push(i)
  else into.splice(idx < 0 ? -idx-1 : idx, 0, i)
}

const removeLocals = (i: Interval, from: Interval[], isFirst: boolean) => {
  const [a, b] = i
  let idx = isFirst ? bs(from, a, cmpFirst) : bs(from, b, cmpSecond)

  if (idx < 0) return false

  // idx refers to an index somewhere within the list. Not necessarily the
  // first or the last.
  const ii = isFirst ? 0 : 1
  while (idx > 0 && from[idx-1][ii] === i[ii]) idx--
  for (; idx < from.length && from[idx][ii] === i[ii]; idx++) {
    if (from[idx] === i) { // Found it.
      from.splice(idx, 1)
      return true
    }
  }

  return false
}

class TreeNode {
  centre: number

  // All child intervals either:
  // - Contain centre in their range
  left: TreeNode | null
  right: TreeNode | null

  byStart: Interval[]
  byEnd: Interval[]

  constructor(centre: number) {
    this.centre = centre
    this.left = this.right = null
    this.byStart = []
    this.byEnd = []
  }

  addInterval(i: Interval) {
    if (i[0] > this.centre) {
      if (this.right == null) this.right = new TreeNode(centre(i))
      this.right.addInterval(i)
    } else if (i[1] <= this.centre) { // <= because == wouldn't intersect.
      if (this.left == null) this.left = new TreeNode(centre(i))
      this.left.addInterval(i)
    } else {
      // Add locally.
      insertLocals(i, this.byStart, true)
      insertLocals(i, this.byEnd, false)
    }
  }

  removeIntervalRef(i: Interval): boolean {
    if (i[0] > this.centre) {
      if (this.right == null) return false
      return this.right.removeIntervalRef(i)
    } else if (i[1] < this.centre) {
      if (this.left == null) return false
      return this.left.removeIntervalRef(i)
    } else {
      removeLocals(i, this.byStart, true)
      return removeLocals(i, this.byEnd, false)
    }
  }

  *queryPoint(p: number, sort: boolean): Iterable<Interval> {
    if (p < this.centre) {
      if (this.left) yield* this.left.queryPoint(p, sort)
      for (let i = 0; i < this.byStart.length && this.byStart[i][0] <= p; i++) {
        yield this.byStart[i]
      }
    } else if (p === this.centre) {
      yield* this.byStart
    } else { // p > this.centre
      if (sort) {
        // I need to yield them in reverse order. Using a linear scan here
        // because we're O(n) here anyway and this is simpler than doing a
        // binary search then scanning backwards.
        let i = this.byEnd.length
        while (i > 0 && this.byEnd[i-1][1] > p) i--
        yield *this.byEnd.slice(i).sort(sortCmp)
      } else {
        for (let i = this.byEnd.length - 1; i >= 0 && this.byEnd[i][1] > p; i--)
          yield this.byEnd[i]
      }
      // for (; i < this.byEnd.length; i++) yield this.byEnd[i]

      if (this.right) yield* this.right.queryPoint(p, sort)
    }
  }
}


class IntervalTree {
  // Like most tree based data structures, this has the capacity to become
  // unbalanced based on how its used.

  root: TreeNode | null

  constructor() {
    this.root = null
    // this.root = new TreeNode
  }

  // Intervals are considered as [start, end) ranges.
  addInterval(a: number, b: number, data?: any) {
    assert(b >= a)
    const i: Interval = data === undefined ? [a, b] : [a, b, data]
    if (this.root === null) this.root = new TreeNode(centre(i))
    this.root.addInterval(i)
  }

  widen(p: number, amt: number = 1) {

  }

  shrink(p: number, amt: number = 1) {

  }

  removeIntervalRef(i: Interval): boolean {
    if (this.root == null) return false
    else return this.root.removeIntervalRef(i)
  }

  *queryPoint(p: number, sort: boolean = false) {
    if (this.root != null) yield* this.root.queryPoint(p, sort)
  }

  // *queryInterval(a: number, b: number) {
  //   yield
  // }
}

export default IntervalTree
