import { describe, expect, it } from 'vitest'
import { makeAxial } from '../coords/axial'
import { hasRiverEdge, tileAt } from '../model/map'
import { makeBlankMap } from '../parse/makeMap'
import { applyTileBrush, toggleRiver } from './applyBrush'

const center = makeAxial(0, 0)
const adj = makeAxial(1, 0)

describe('applyTileBrush', () => {
  it('district ブラシは配置可能なら区域を置く', () => {
    const map = applyTileBrush(makeBlankMap(center, 3), adj, {
      kind: 'district',
      district: 'campus',
    })
    expect(tileAt(map, adj)?.district).toBe('campus')
  })

  it('district ブラシは配置不可なら no-op(山岳)', () => {
    let map = applyTileBrush(makeBlankMap(center, 3), adj, { kind: 'terrain', terrain: 'mountain' })
    map = applyTileBrush(map, adj, { kind: 'district', district: 'campus' })
    expect(tileAt(map, adj)?.district).toBeNull()
  })

  it('terrain ブラシは地形を変える', () => {
    const map = applyTileBrush(makeBlankMap(center, 3), adj, { kind: 'terrain', terrain: 'desert' })
    expect(tileAt(map, adj)?.terrain).toBe('desert')
  })

  it('erase はタイルを地形だけに戻す', () => {
    let map = applyTileBrush(makeBlankMap(center, 3), adj, { kind: 'district', district: 'campus' })
    map = applyTileBrush(map, adj, { kind: 'feature', feature: 'woods' })
    map = applyTileBrush(map, adj, { kind: 'erase' })
    expect(tileAt(map, adj)?.district).toBeNull()
    expect(tileAt(map, adj)?.feature).toBeNull()
  })

  it('都心は編集不可(no-op)', () => {
    const map = applyTileBrush(makeBlankMap(center, 3), center, {
      kind: 'terrain',
      terrain: 'desert',
    })
    expect(tileAt(map, center)?.terrain).toBe('grassland')
    expect(tileAt(map, center)?.district).toBe('cityCenter')
  })
})

describe('toggleRiver', () => {
  it('辺の川をトグルできる', () => {
    let map = makeBlankMap(center, 2)
    expect(hasRiverEdge(map, center, adj)).toBe(false)
    map = toggleRiver(map, center, adj)
    expect(hasRiverEdge(map, center, adj)).toBe(true)
    map = toggleRiver(map, center, adj)
    expect(hasRiverEdge(map, center, adj)).toBe(false)
  })
})
