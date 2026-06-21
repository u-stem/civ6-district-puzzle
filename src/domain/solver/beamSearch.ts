import type { AxialCoord } from '../coords/axial'
import { axialKey } from '../coords/axial'
import type { DistrictType } from '../model/district'
import { type HexMap, tileAt, withTile } from '../model/map'
import { makeTile } from '../parse/makeTile'
import { totalAdjacencyScore } from '../rules/adjacency'
import { canPlace } from '../rules/placement'
import { candidateCoords } from './candidate'
import type { Placement, SolveInput, SolveResult } from './types'

function placeDistrict(map: HexMap, c: AxialCoord, d: DistrictType): HexMap {
  const tile = tileAt(map, c)
  if (tile === undefined) return map
  return withTile(map, makeTile({ ...tile, district: d }))
}

type BeamState = {
  readonly map: HexMap
  readonly placements: readonly Placement[]
  readonly score: number
}

/**
 * ビームサーチ(近似・高速)。各段で上位 beamWidth 状態のみ保持する。
 * 最適保証は無いが、候補タイルや区域が多い大規模ケースで実用解を即時に出す。
 */
export function beamSearchSolve(input: SolveInput, beamWidth = 64): SolveResult {
  const { districts, rules, weights } = input
  let beam: BeamState[] = [{ map: input.map, placements: [], score: 0 }]
  let nodes = 0

  for (const d of districts) {
    const next: BeamState[] = []
    for (const state of beam) {
      for (const c of candidateCoords(state.map)) {
        if (!canPlace(state.map, c, d)) continue
        nodes++
        const map = placeDistrict(state.map, c, d)
        next.push({
          map,
          placements: [...state.placements, { district: d, coord: c }],
          score: totalAdjacencyScore(map, rules, weights),
        })
      }
    }
    if (next.length === 0) break // これ以上置けない
    next.sort((a, b) => b.score - a.score)
    beam = dedupe(next).slice(0, beamWidth)
  }

  const best = beam.reduce<BeamState | null>(
    (acc, s) => (acc === null || s.score > acc.score ? s : acc),
    null,
  )
  if (best === null) {
    return {
      placements: [],
      score: totalAdjacencyScore(input.map, rules, weights),
      map: input.map,
      nodesExplored: nodes,
    }
  }
  return {
    placements: best.placements,
    score: best.score,
    map: best.map,
    nodesExplored: nodes,
  }
}

/** 同一配置集合の状態を畳む(順序非依存のキーで重複排除)。 */
function dedupe(states: readonly BeamState[]): BeamState[] {
  const seen = new Set<string>()
  const result: BeamState[] = []
  for (const s of states) {
    const key = s.placements
      .map((p) => `${p.district}@${axialKey(p.coord)}`)
      .sort()
      .join(',')
    if (seen.has(key)) continue
    seen.add(key)
    result.push(s)
  }
  return result
}
