import { describe, expect, it } from 'vitest'
import { axialKey, makeAxial } from '../coords/axial'
import { isRiverAdjacent, tileAt, withRiverEdge } from '../model/map'
import { hexField, makeBlankMap } from './makeMap'

describe('hexField', () => {
  it('半径 1 は 7 タイル、半径 3 は 37 タイル', () => {
    const center = makeAxial(0, 0)
    expect(hexField(center, 1)).toHaveLength(7)
    expect(hexField(center, 3)).toHaveLength(37)
  })
})

describe('makeBlankMap', () => {
  it('中心に都心を置く', () => {
    const center = makeAxial(0, 0)
    const map = makeBlankMap(center, 3)
    expect(tileAt(map, center)?.district).toBe('cityCenter')
    expect(map.tiles.size).toBe(37)
  })

  it('都心以外は区域なしの草原', () => {
    const center = makeAxial(0, 0)
    const map = makeBlankMap(center, 3)
    const edge = makeAxial(3, 0)
    expect(tileAt(map, edge)?.district).toBeNull()
    expect(tileAt(map, edge)?.terrain).toBe('grassland')
  })
})

describe('川エッジ', () => {
  it('辺を引くと両側のタイルが川隣接になる', () => {
    const center = makeAxial(0, 0)
    const a = makeAxial(0, 0)
    const b = makeAxial(1, -1)
    const map = withRiverEdge(makeBlankMap(center, 2), a, b, true)
    expect(isRiverAdjacent(map, a)).toBe(true)
    expect(isRiverAdjacent(map, b)).toBe(true)
  })

  it('川に接しないタイルは false', () => {
    const center = makeAxial(0, 0)
    const map = withRiverEdge(makeBlankMap(center, 2), makeAxial(0, 0), makeAxial(1, -1), true)
    expect(isRiverAdjacent(map, makeAxial(2, 0))).toBe(false)
  })

  it('present=false で川を消せる', () => {
    const center = makeAxial(0, 0)
    const a = makeAxial(0, 0)
    const b = makeAxial(1, -1)
    let map = withRiverEdge(makeBlankMap(center, 2), a, b, true)
    map = withRiverEdge(map, a, b, false)
    expect(isRiverAdjacent(map, a)).toBe(false)
  })
})

describe('axialKey 安定性', () => {
  it('同一座標は同一キー', () => {
    expect(axialKey(makeAxial(1, 2))).toBe(axialKey(makeAxial(1, 2)))
  })
})
