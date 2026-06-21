import { describe, expect, it } from 'vitest'
import { makeAxial } from '@/domain/coords/axial'
import { hexCorners, hexToPixel, makeLayout } from './hexGeometry'

describe('hexToPixel', () => {
  it('原点座標は origin に一致', () => {
    const layout = makeLayout(10, { x: 5, y: 7 })
    expect(hexToPixel(layout, makeAxial(0, 0))).toEqual({ x: 5, y: 7 })
  })

  it('隣接タイルは離れて配置される', () => {
    const layout = makeLayout(10)
    const a = hexToPixel(layout, makeAxial(0, 0))
    const b = hexToPixel(layout, makeAxial(1, 0))
    expect(b.x).toBeGreaterThan(a.x)
  })
})

describe('hexCorners', () => {
  it('6 頂点を返す', () => {
    expect(hexCorners(makeLayout(10), makeAxial(0, 0))).toHaveLength(6)
  })

  it('頂点は中心から size の距離', () => {
    const layout = makeLayout(10)
    const center = hexToPixel(layout, makeAxial(0, 0))
    for (const p of hexCorners(layout, makeAxial(0, 0))) {
      const d = Math.hypot(p.x - center.x, p.y - center.y)
      expect(d).toBeCloseTo(10, 5)
    }
  })
})
