import { describe, expect, it } from 'vitest'
import { type AxialCoord, axialKey, makeAxial } from '../coords/axial'
import { neighbors } from '../coords/neighbors'
import type { DistrictType } from '../model/district'
import { type HexMap, tileAt, withRiverEdge, withTile } from '../model/map'
import type { Tile } from '../model/tile'
import { makeBlankMap } from '../parse/makeMap'
import { makeTile } from '../parse/makeTile'
import {
  computeAllBonuses,
  computeDistrictBonus,
  ruleContribution,
  totalAdjacencyScore,
} from './adjacency'
import type { AdjacencyRule, DistrictRuleset } from './adjacencyRules'

const center = makeAxial(0, 0)

/** i 番目の近傍(常に存在するが noUncheckedIndexedAccess 対策で明示)。 */
function nb(c: AxialCoord, i: number): AxialCoord {
  const n = neighbors(c)[i]
  if (n === undefined) throw new Error(`no neighbor ${i}`)
  return n
}

/** 座標のタイルを部分更新する。 */
function place(map: HexMap, c: AxialCoord, patch: Partial<Tile>): HexMap {
  const existing = tileAt(map, c)
  if (existing === undefined) throw new Error(`no tile at ${axialKey(c)}`)
  return withTile(map, makeTile({ ...existing, ...patch, coord: c }))
}

function withDistrictAt(map: HexMap, c: AxialCoord, district: DistrictType): HexMap {
  return place(map, c, { district })
}

/** すべての区域種別に空ルールを与えたベース。テストで一部だけ上書きする。 */
function emptyRuleset(): DistrictRuleset {
  return {
    cityCenter: [],
    campus: [],
    holySite: [],
    theaterSquare: [],
    commercialHub: [],
    harbor: [],
    industrialZone: [],
    encampment: [],
    entertainmentComplex: [],
    aqueduct: [],
    neighborhood: [],
    governmentPlaza: [],
    aerodrome: [],
    spaceport: [],
  }
}

describe('ruleContribution', () => {
  const at = makeAxial(1, 0)
  const minorRule: AdjacencyRule = {
    source: { kind: 'feature', feature: 'rainforest' },
    yieldType: 'science',
    amountPerMatch: 0.5,
    counting: 'perAdjacentTile',
  }

  it('perAdjacentTile は対象タイル数 × amount(分数のまま)', () => {
    let map = makeBlankMap(center, 2)
    map = place(map, nb(at, 0), { feature: 'rainforest' })
    map = place(map, nb(at, 1), { feature: 'rainforest' })
    expect(ruleContribution(map, at, minorRule)).toBe(1)
  })

  it('minor 1 つは 0.5(floor 前)', () => {
    let map = makeBlankMap(center, 2)
    map = place(map, nb(at, 0), { feature: 'rainforest' })
    expect(ruleContribution(map, at, minorRule)).toBe(0.5)
  })

  it('onceIfAnyPresent は 1 つでもあれば amount、無ければ 0', () => {
    const wonderRule: AdjacencyRule = {
      source: { kind: 'worldWonder' },
      yieldType: 'culture',
      amountPerMatch: 2,
      counting: 'onceIfAnyPresent',
    }
    let map = makeBlankMap(center, 2)
    expect(ruleContribution(map, at, wonderRule)).toBe(0)
    map = place(map, nb(at, 0), { hasWorldWonder: true })
    map = place(map, nb(at, 1), { hasWorldWonder: true })
    expect(ruleContribution(map, at, wonderRule)).toBe(2)
  })

  it('river は辺ベースで判定する', () => {
    const riverRule: AdjacencyRule = {
      source: { kind: 'river' },
      yieldType: 'gold',
      amountPerMatch: 2,
      counting: 'onceIfAnyPresent',
    }
    let map = makeBlankMap(center, 2)
    expect(ruleContribution(map, at, riverRule)).toBe(0)
    map = withRiverEdge(map, at, nb(at, 0), true)
    expect(ruleContribution(map, at, riverRule)).toBe(2)
  })
})

describe('computeDistrictBonus（floor は最後に 1 回）', () => {
  const ruleset: DistrictRuleset = {
    ...emptyRuleset(),
    campus: [
      {
        source: { kind: 'feature', feature: 'rainforest' },
        yieldType: 'science',
        amountPerMatch: 0.5,
        counting: 'perAdjacentTile',
      },
    ],
  }
  const at = makeAxial(1, 0)

  function withRainforests(count: number): HexMap {
    let map = makeBlankMap(center, 2)
    map = withDistrictAt(map, at, 'campus')
    for (let i = 0; i < count; i++) {
      map = place(map, nb(at, i), { feature: 'rainforest' })
    }
    return map
  }

  it('minor 1 つ → floor(0.5) = 0(イールドは出ない)', () => {
    expect(computeDistrictBonus(withRainforests(1), at, ruleset).science).toBeUndefined()
  })

  it('minor 2 つ → floor(1.0) = 1', () => {
    expect(computeDistrictBonus(withRainforests(2), at, ruleset).science).toBe(1)
  })

  it('minor 3 つ → floor(1.5) = 1', () => {
    expect(computeDistrictBonus(withRainforests(3), at, ruleset).science).toBe(1)
  })

  it('区域が無いタイルは空ボーナス', () => {
    expect(computeDistrictBonus(makeBlankMap(center, 2), at, ruleset)).toEqual({})
  })
})

describe('computeAllBonuses / totalAdjacencyScore', () => {
  const ruleset: DistrictRuleset = {
    ...emptyRuleset(),
    campus: [
      {
        source: { kind: 'terrain', terrain: 'mountain' },
        yieldType: 'science',
        amountPerMatch: 1,
        counting: 'perAdjacentTile',
      },
    ],
  }

  it('都心は集計対象に含めない', () => {
    const all = computeAllBonuses(makeBlankMap(center, 2), ruleset)
    expect(all.has(axialKey(center))).toBe(false)
  })

  it('合計スコア = 各区域ボーナスの総和', () => {
    let map = makeBlankMap(center, 3)
    const a = makeAxial(2, 0)
    const b = makeAxial(-2, 0)
    map = withDistrictAt(map, a, 'campus')
    map = withDistrictAt(map, b, 'campus')
    // a の山岳 2 つ(center 非隣接、b 非隣接の座標)
    map = place(map, makeAxial(3, 0), { terrain: 'mountain' })
    map = place(map, makeAxial(3, -1), { terrain: 'mountain' })
    // b の山岳 1 つ
    map = place(map, makeAxial(-3, 0), { terrain: 'mountain' })

    const all = computeAllBonuses(map, ruleset)
    const manual = [...all.values()].reduce((s, bonus) => s + (bonus.science ?? 0), 0)
    expect(totalAdjacencyScore(map, ruleset)).toBe(manual)
    expect(manual).toBe(3)
  })

  it('weights で対象イールドを絞れる', () => {
    let map = makeBlankMap(center, 3)
    const a = makeAxial(2, 0)
    map = withDistrictAt(map, a, 'campus')
    map = place(map, makeAxial(3, 0), { terrain: 'mountain' })
    expect(totalAdjacencyScore(map, ruleset, { science: 1 })).toBe(1)
    expect(totalAdjacencyScore(map, ruleset, { gold: 1 })).toBe(0)
  })
})
