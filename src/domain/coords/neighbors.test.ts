import { describe, expect, it } from 'vitest'
import { axialKey, makeAxial } from './axial'
import { hexDistance, neighbors } from './neighbors'

describe('neighbors', () => {
  it('常に 6 要素を返す', () => {
    expect(neighbors(makeAxial(0, 0))).toHaveLength(6)
    expect(neighbors(makeAxial(3, -5))).toHaveLength(6)
  })

  it('すべての近傍は距離 1', () => {
    const center = makeAxial(2, -1)
    for (const n of neighbors(center)) {
      expect(hexDistance(center, n)).toBe(1)
    }
  })

  it('近傍はすべて相異なる', () => {
    const keys = neighbors(makeAxial(0, 0)).map(axialKey)
    expect(new Set(keys).size).toBe(6)
  })

  it('対称性: a が b の近傍なら b も a の近傍', () => {
    const a = makeAxial(1, 1)
    for (const b of neighbors(a)) {
      const back = neighbors(b).map(axialKey)
      expect(back).toContain(axialKey(a))
    }
  })
})

describe('hexDistance', () => {
  it('同一座標は 0', () => {
    expect(hexDistance(makeAxial(4, -2), makeAxial(4, -2))).toBe(0)
  })

  it('対称', () => {
    const a = makeAxial(0, 0)
    const b = makeAxial(2, -3)
    expect(hexDistance(a, b)).toBe(hexDistance(b, a))
  })
})
