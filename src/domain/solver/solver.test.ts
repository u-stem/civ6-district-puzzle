import { describe, expect, it } from 'vitest'
import { type AxialCoord, axialKey, makeAxial } from '../coords/axial'
import type { DistrictType } from '../model/district'
import { type HexMap, tileAt, withTile } from '../model/map'
import type { Tile } from '../model/tile'
import { makeBlankMap } from '../parse/makeMap'
import { makeTile } from '../parse/makeTile'
import { RF_RULESET } from '../rules/adjacencyRules'
import { beamSearchSolve } from './beamSearch'
import { branchAndBoundSolve } from './branchAndBound'
import { bruteForceSolve } from './bruteForce'
import type { SolveInput } from './types'
import { upperBound } from './upperBound'

const center = makeAxial(0, 0)

function place(map: HexMap, c: AxialCoord, patch: Partial<Tile>): HexMap {
  const existing = tileAt(map, c)
  if (existing === undefined) throw new Error(`no tile at ${axialKey(c)}`)
  return withTile(map, makeTile({ ...existing, ...patch, coord: c }))
}

/** 半径 1 の小盤面に山岳を 1 つ置いた地形を作る。 */
function smallTerrain(): HexMap {
  let map = makeBlankMap(center, 1)
  map = place(map, makeAxial(1, 0), { terrain: 'mountain' })
  return map
}

describe('branchAndBound は bruteForce と同じ最適スコア', () => {
  const cases: { readonly name: string; readonly districts: readonly DistrictType[] }[] = [
    { name: 'campus 1 つ', districts: ['campus'] },
    { name: 'campus + holySite', districts: ['campus', 'holySite'] },
    {
      name: 'campus + holySite + theaterSquare',
      districts: ['campus', 'holySite', 'theaterSquare'],
    },
  ]

  for (const { name, districts } of cases) {
    it(name, () => {
      const input: SolveInput = { map: smallTerrain(), districts, rules: RF_RULESET }
      const brute = bruteForceSolve(input)
      const bb = branchAndBoundSolve(input)
      expect(bb.score).toBe(brute.score)
    })
  }
})

describe('branchAndBound（半径 2、複数区域）は bruteForce と一致', () => {
  function terrain2(): HexMap {
    let map = makeBlankMap(center, 2)
    map = place(map, makeAxial(2, -1), { terrain: 'mountain' })
    map = place(map, makeAxial(1, 1), { terrain: 'mountain' })
    map = place(map, makeAxial(-1, 0), { feature: 'rainforest' })
    return map
  }

  it('campus + holySite + commercialHub', () => {
    const input: SolveInput = {
      map: terrain2(),
      districts: ['campus', 'holySite', 'commercialHub'],
      rules: RF_RULESET,
    }
    expect(branchAndBoundSolve(input).score).toBe(bruteForceSolve(input).score)
  })
})

describe('upperBound 回帰: districtType 給付がある配置でも B&B が最適を取りこぼさない', () => {
  // 既存の特産区域を複数置き、政府複合施設(隣接特産へ +1 給付)を解かせる。
  // 旧 givingSlack(0.5 固定)では最適枝を誤って刈る可能性があった条件。
  function preplacedSpecialties(): HexMap {
    let map = makeBlankMap(center, 3)
    map = place(map, makeAxial(2, 0), { district: 'campus' })
    map = place(map, makeAxial(2, -1), { district: 'holySite' })
    map = place(map, makeAxial(1, 1), { district: 'theaterSquare' })
    return map
  }

  it('政府複合施設 1 つ', () => {
    const input: SolveInput = {
      map: preplacedSpecialties(),
      districts: ['governmentPlaza'],
      rules: RF_RULESET,
    }
    expect(branchAndBoundSolve(input).score).toBe(bruteForceSolve(input).score)
  })

  it('港 + 商業ハブ(港→商業ハブ +2 の給付)', () => {
    let map = makeBlankMap(center, 3)
    // 海岸の帯を作って港を置けるようにする
    map = place(map, makeAxial(2, 0), { terrain: 'coast' })
    map = place(map, makeAxial(2, 1), { terrain: 'coast' })
    const input: SolveInput = {
      map,
      districts: ['harbor', 'commercialHub'],
      rules: RF_RULESET,
    }
    expect(branchAndBoundSolve(input).score).toBe(bruteForceSolve(input).score)
  })
})

describe('upperBound は admissible(真の最適以上)', () => {
  it('空配置の上界 ≥ 最適スコア', () => {
    const input: SolveInput = {
      map: smallTerrain(),
      districts: ['campus', 'holySite'],
      rules: RF_RULESET,
    }
    const opt = bruteForceSolve(input).score
    const bound = upperBound(input.map, input.districts, input.rules, undefined)
    expect(bound).toBeGreaterThanOrEqual(opt)
  })
})

describe('beamSearch は exact 以下だが妥当', () => {
  it('beam スコア ≤ exact スコア', () => {
    const input: SolveInput = {
      map: makeBlankMap(center, 2),
      districts: ['campus', 'holySite', 'theaterSquare'],
      rules: RF_RULESET,
    }
    const exact = branchAndBoundSolve(input).score
    const beam = beamSearchSolve(input).score
    expect(beam).toBeLessThanOrEqual(exact)
  })

  it('十分広いビーム幅なら exact に一致(小盤面)', () => {
    const input: SolveInput = {
      map: smallTerrain(),
      districts: ['campus', 'holySite'],
      rules: RF_RULESET,
    }
    const exact = branchAndBoundSolve(input).score
    const beam = beamSearchSolve(input, 1000).score
    expect(beam).toBe(exact)
  })
})

describe('解はすべての区域を配置し、座標は重複しない', () => {
  it('placements の座標は distinct', () => {
    const input: SolveInput = {
      map: makeBlankMap(center, 2),
      districts: ['campus', 'holySite', 'theaterSquare'],
      rules: RF_RULESET,
    }
    const result = branchAndBoundSolve(input)
    expect(result.placements).toHaveLength(3)
    const keys = result.placements.map((p) => axialKey(p.coord))
    expect(new Set(keys).size).toBe(3)
  })
})
