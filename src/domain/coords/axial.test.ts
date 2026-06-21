import { describe, expect, it } from 'vitest'
import { axialKey, axialToCube, cubeToAxial, makeAxial } from './axial'

describe('makeAxial', () => {
  it('整数で生成できる', () => {
    const c = makeAxial(1, -2)
    expect(c.q).toBe(1)
    expect(c.r).toBe(-2)
  })

  it('非整数は RangeError', () => {
    expect(() => makeAxial(1.5, 0)).toThrow(RangeError)
    expect(() => makeAxial(0, Number.NaN)).toThrow(RangeError)
  })
})

describe('axialKey', () => {
  it('q,r を安定文字列にする', () => {
    expect(axialKey(makeAxial(2, -3))).toBe('2,-3')
  })
})

describe('axial ↔ cube', () => {
  it('cube は x + y + z = 0 を満たす', () => {
    const cube = axialToCube(makeAxial(2, -1))
    expect(cube.x + cube.y + cube.z).toBe(0)
  })

  it('往復で一致する', () => {
    for (const [q, r] of [
      [0, 0],
      [3, -2],
      [-4, 1],
      [5, 5],
    ] as const) {
      const a = makeAxial(q, r)
      expect(axialKey(cubeToAxial(axialToCube(a)))).toBe(axialKey(a))
    }
  })
})
