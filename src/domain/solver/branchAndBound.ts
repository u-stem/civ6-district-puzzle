import type { AxialCoord } from '../coords/axial'
import type { DistrictType } from '../model/district'
import { type HexMap, tileAt, withTile } from '../model/map'
import { makeTile } from '../parse/makeTile'
import { totalAdjacencyScore } from '../rules/adjacency'
import { canPlace } from '../rules/placement'
import { candidateCoords } from './candidate'
import type { Placement, SolveInput, SolveResult } from './types'
import { upperBound } from './upperBound'

function placeDistrict(map: HexMap, c: AxialCoord, d: DistrictType): HexMap {
  const tile = tileAt(map, c)
  if (tile === undefined) return map
  return withTile(map, makeTile({ ...tile, district: d }))
}

/**
 * 分枝限定法(DFS + admissible 上界枝刈り)による厳密ソルバー。
 * 上界 ≤ 現在のベストなら枝を刈る。bruteForce と同じ最適値を返す。
 */
export function branchAndBoundSolve(input: SolveInput): SolveResult {
  const { districts, rules, weights } = input
  let bestScore = Number.NEGATIVE_INFINITY
  let bestPlacements: readonly Placement[] = []
  let bestMap: HexMap = input.map
  let nodes = 0

  function recurse(map: HexMap, idx: number, placements: Placement[]): void {
    if (idx === districts.length) {
      // 葉(全区域配置完了)を 1 ノードとして数える。bruteForce と意味を揃える。
      nodes++
      const score = totalAdjacencyScore(map, rules, weights)
      if (score > bestScore) {
        bestScore = score
        bestPlacements = [...placements]
        bestMap = map
      }
      return
    }

    // 枝刈り: 残りを最大限うまく置いても現ベストを超えられないなら打ち切り
    const remaining = districts.slice(idx)
    if (upperBound(map, remaining, rules, weights) <= bestScore) return

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
