import { describe, expect, it } from 'vitest'
import { type AxialCoord, axialKey, makeAxial } from '../coords/axial'
import { neighbors } from '../coords/neighbors'
import type { DistrictType } from '../model/district'
import { type HexMap, tileAt, withRiverEdge, withTile } from '../model/map'
import type { Tile } from '../model/tile'
import { makeBlankMap } from '../parse/makeMap'
import { makeTile } from '../parse/makeTile'
import { computeDistrictBonus } from './adjacency'
import { RF_RULESET } from './adjacencyRules'

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

function placed(map: HexMap, c: AxialCoord, district: DistrictType): HexMap {
  return place(map, c, { district })
}

// 都心(0,0)に隣接しない座標(都心からの汎用 Minor +0.5 を排除して単独効果を検証)。
const iso = makeAxial(2, 0)
// 都心に隣接する座標(港の都心ボーナス検証用)。
const adjToCenter = makeAxial(1, 0)

describe('RF_RULESET の段階値(Major=+2 / Standard=+1 / Minor=+0.5)', () => {
  it('Campus: 山岳 1 = +1 科学(Standard)', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'campus')
    map = place(map, nb(iso, 0), { terrain: 'mountain' })
    expect(computeDistrictBonus(map, iso, RF_RULESET).science).toBe(1)
  })

  it('Campus: 山岳 2 = +2 科学', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'campus')
    map = place(map, nb(iso, 0), { terrain: 'mountain' })
    map = place(map, nb(iso, 1), { terrain: 'mountain' })
    expect(computeDistrictBonus(map, iso, RF_RULESET).science).toBe(2)
  })

  it('Campus: 熱帯雨林 1 = +0(Minor は floor で 0)', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'campus')
    map = place(map, nb(iso, 0), { feature: 'rainforest' })
    expect(computeDistrictBonus(map, iso, RF_RULESET).science).toBeUndefined()
  })

  it('Holy Site: 自然遺産 1 = +2 信仰(Major)', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'holySite')
    map = place(map, nb(iso, 0), { feature: 'naturalWonder' })
    expect(computeDistrictBonus(map, iso, RF_RULESET).faith).toBe(2)
  })

  it('Holy Site: 山岳 1 = +1 信仰(Standard)', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'holySite')
    map = place(map, nb(iso, 0), { terrain: 'mountain' })
    expect(computeDistrictBonus(map, iso, RF_RULESET).faith).toBe(1)
  })

  it('Commercial Hub: 河川(複数辺)= +2 ゴールド(Major、一度だけ)', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'commercialHub')
    map = withRiverEdge(map, iso, nb(iso, 0), true)
    map = withRiverEdge(map, iso, nb(iso, 1), true)
    expect(computeDistrictBonus(map, iso, RF_RULESET).gold).toBe(2)
  })

  it('Harbor: 都心隣接 = +2 ゴールド(Major) + 都心の汎用 Minor', () => {
    // adjToCenter は都心の隣接。海岸にして港を置く → +2(Major) + 0.5(都心) = 2.5 → 2
    let map = place(makeBlankMap(center, 3), adjToCenter, { terrain: 'coast' })
    map = placed(map, adjToCenter, 'harbor')
    expect(computeDistrictBonus(map, adjToCenter, RF_RULESET).gold).toBe(2)
  })

  it('Harbor: 沿岸資源(海上)は +1、陸上資源は数えない', () => {
    // adjToCenter を海岸にして港を置く。近傍の海タイルに資源 → +1、陸タイルの資源 → 無視。
    let map = place(makeBlankMap(center, 3), adjToCenter, { terrain: 'coast' })
    map = placed(map, adjToCenter, 'harbor')
    // adjToCenter の近傍に「海上資源」と「陸上資源」を 1 つずつ置く
    const seaResource = nb(adjToCenter, 0)
    const landResource = nb(adjToCenter, 4)
    map = place(map, seaResource, {
      terrain: 'coast',
      resource: { name: 'fish', resourceClass: 'bonus' },
    })
    map = place(map, landResource, {
      terrain: 'grassland',
      resource: { name: 'wheat', resourceClass: 'bonus' },
    })
    // 都心 +2(Major) + 都心の汎用 Minor +0.5 + 沿岸資源 +1(Standard) = 3.5 → floor 3
    // 陸上資源は数えないので 4.5 にはならない。
    expect(computeDistrictBonus(map, adjToCenter, RF_RULESET).gold).toBe(3)
  })

  it('Government Plaza 隣接の特産区域は Minor + Standard = +1.5 → floor 1', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'campus')
    map = placed(map, nb(iso, 0), 'governmentPlaza')
    expect(computeDistrictBonus(map, iso, RF_RULESET).science).toBe(1)
  })

  it('隣接区域 1 つのみ(汎用 Minor)= +0(floor)', () => {
    let map = placed(makeBlankMap(center, 3), iso, 'campus')
    map = placed(map, nb(iso, 0), 'holySite')
    expect(computeDistrictBonus(map, iso, RF_RULESET).science).toBeUndefined()
  })
})
