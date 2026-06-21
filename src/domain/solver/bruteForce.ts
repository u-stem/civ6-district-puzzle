import type { AxialCoord } from '../coords/axial'
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

/**
 * 全探索の参照ソルバー。小盤面でのみ使う(分枝限定の正しさ検証の真値)。
 * districts を順に、配置可能な空きタイルへ distinct に割り当てる全組合せを試す。
 */
export function bruteForceSolve(input: SolveInput): SolveResult {
  const { districts, rules, weights } = input
  let bestScore = Number.NEGATIVE_INFINITY
  let bestPlacements: readonly Placement[] = []
  let bestMap: HexMap = input.map
  let nodes = 0

  function recurse(map: HexMap, idx: number, placements: Placement[]): void {
    if (idx === districts.length) {
      nodes++
      const score = totalAdjacencyScore(map, rules, weights)
      if (score > bestScore) {
        bestScore = score
        bestPlacements = [...placements]
        bestMap = map
      }
      return
    }
    const d = districts[idx]
    if (d === undefined) return
    for (const c of candidateCoords(map)) {
      if (!canPlace(map, c, d)) continue
      placements.push({ district: d, coord: c })
      recurse(placeDistrict(map, c, d), idx + 1, placements)
      placements.pop()
    }
  }

  recurse(input.map, 0, [])

  return {
    placements: bestPlacements,
    score:
      bestScore === Number.NEGATIVE_INFINITY
        ? totalAdjacencyScore(input.map, rules, weights)
        : bestScore,
    map: bestMap,
    nodesExplored: nodes,
  }
}
