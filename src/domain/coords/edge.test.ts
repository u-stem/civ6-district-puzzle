import { describe, expect, it } from 'vitest'
import { makeAxial } from './axial'
import { edgeKey, tileEdgeKeys } from './edge'

describe('edgeKey', () => {
  it('方向に依存せず同一キー', () => {
    const a = makeAxial(0, 0)
    const b = makeAxial(1, -1)
    expect(edgeKey(a, b)).toBe(edgeKey(b, a))
  })

  it('異なる辺は異なるキー', () => {
    const center = makeAxial(0, 0)
    const [n0, n1] = [makeAxial(1, 0), makeAxial(0, 1)]
    expect(edgeKey(center, n0)).not.toBe(edgeKey(center, n1))
  })
})

describe('tileEdgeKeys', () => {
  it('6 辺を返し、すべて相異なる', () => {
    const keys = tileEdgeKeys(makeAxial(2, -1))
    expect(keys).toHaveLength(6)
    expect(new Set(keys).size).toBe(6)
  })

  it('隣接する 2 タイルは共有辺を 1 つ持つ', () => {
    const a = makeAxial(0, 0)
    const b = makeAxial(1, -1)
    const shared = tileEdgeKeys(a).filter((k) => tileEdgeKeys(b).includes(k))
    expect(shared).toEqual([edgeKey(a, b)])
  })
})
