import { describe, expect, it } from 'vitest'
import { type AxialCoord, axialKey, makeAxial } from '../coords/axial'
import { neighbors } from '../coords/neighbors'
import { type HexMap, tileAt, withRiverEdge, withTile } from '../model/map'
import type { Tile } from '../model/tile'
import { makeBlankMap } from '../parse/makeMap'
import { makeTile } from '../parse/makeTile'
import { canPlace } from './placement'

const center = makeAxial(0, 0)

function nb(c: AxialCoord, i: number): AxialCoord {
  const n = neighbors(c)[i]
  if (n === undefined) throw new Error(`no neighbor ${i}`)
  return n
}

function place(map: HexMap, c: AxialCoord, patch: Partial<Tile>): HexMap {
  const existing = tileAt(map, c)
  if (existing === undefined) throw new Error(`no tile at ${axialKey(c)}`)
  return withTile(map, makeTile({ ...existing, ...patch, coord: c }))
}

describe('canPlace', () => {
  const adj = makeAxial(1, 0) // 都心の近傍

  it('草原の空きタイルには陸上区域を置ける', () => {
    expect(canPlace(makeBlankMap(center, 3), adj, 'campus')).toBe(true)
  })

  it('都心タイルには置けない', () => {
    expect(canPlace(makeBlankMap(center, 3), center, 'campus')).toBe(false)
  })

  it('既に区域があるタイルには置けない', () => {
    const map = place(makeBlankMap(center, 3), adj, { district: 'campus' })
    expect(canPlace(map, adj, 'holySite')).toBe(false)
  })

  it('山岳・海洋には陸上区域を置けない', () => {
    let map = place(makeBlankMap(center, 3), adj, { terrain: 'mountain' })
    expect(canPlace(map, adj, 'campus')).toBe(false)
    map = place(makeBlankMap(center, 3), adj, { terrain: 'ocean' })
    expect(canPlace(map, adj, 'campus')).toBe(false)
  })

  it('自然遺産タイルには置けない', () => {
    const map = place(makeBlankMap(center, 3), adj, { feature: 'naturalWonder' })
    expect(canPlace(map, adj, 'campus')).toBe(false)
  })

  it('作業範囲(半径 3)外には置けない', () => {
    const far = makeAxial(4, 0)
    const map = makeBlankMap(center, 4)
    expect(canPlace(map, far, 'campus')).toBe(false)
  })

  describe('港(水上区域)', () => {
    it('陸に隣接する海岸タイルに置ける', () => {
      const map = place(makeBlankMap(center, 3), adj, { terrain: 'coast' })
      expect(canPlace(map, adj, 'harbor')).toBe(true)
    })

    it('陸上タイルには置けない', () => {
      expect(canPlace(makeBlankMap(center, 3), adj, 'harbor')).toBe(false)
    })

    it('リーフのある海岸タイルには置けない', () => {
      const map = place(makeBlankMap(center, 3), adj, { terrain: 'coast', feature: 'reef' })
      expect(canPlace(map, adj, 'harbor')).toBe(false)
    })
  })

  describe('兵営', () => {
    it('都心に隣接するタイルには置けない', () => {
      expect(canPlace(makeBlankMap(center, 3), adj, 'encampment')).toBe(false)
    })

    it('都心に隣接しないタイルには置ける', () => {
      const far = makeAxial(2, 0)
      expect(canPlace(makeBlankMap(center, 3), far, 'encampment')).toBe(true)
    })
  })

  describe('飛行場・宇宙基地(平坦地のみ)', () => {
    it('地形フィーチャーがあると置けない', () => {
      const far = makeAxial(2, 0)
      const map = place(makeBlankMap(center, 3), far, { feature: 'woods' })
      expect(canPlace(map, far, 'aerodrome')).toBe(false)
      expect(canPlace(map, far, 'spaceport')).toBe(false)
    })

    it('フィーチャーなしの陸地には置ける', () => {
      const far = makeAxial(2, 0)
      expect(canPlace(makeBlankMap(center, 3), far, 'spaceport')).toBe(true)
    })
  })

  describe('水道', () => {
    it('都心隣接 + 河川隣接で置ける', () => {
      const map = withRiverEdge(makeBlankMap(center, 3), adj, nb(adj, 2), true)
      expect(canPlace(map, adj, 'aqueduct')).toBe(true)
    })

    it('都心隣接 + 山岳隣接で置ける', () => {
      const map = place(makeBlankMap(center, 3), nb(adj, 0), { terrain: 'mountain' })
      expect(canPlace(map, adj, 'aqueduct')).toBe(true)
    })

    it('都心に隣接していても水源が無ければ置けない', () => {
      expect(canPlace(makeBlankMap(center, 3), adj, 'aqueduct')).toBe(false)
    })

    it('都心と共有する辺の川は水源として数えない', () => {
      // adj と都心(center)の間の辺にだけ川がある → 水源にならない
      const map = withRiverEdge(makeBlankMap(center, 3), adj, center, true)
      expect(canPlace(map, adj, 'aqueduct')).toBe(false)
    })

    it('都心に隣接していなければ置けない', () => {
      const far = makeAxial(2, 0)
      const map = place(makeBlankMap(center, 3), nb(far, 0), { terrain: 'mountain' })
      expect(canPlace(map, far, 'aqueduct')).toBe(false)
    })
  })
})
