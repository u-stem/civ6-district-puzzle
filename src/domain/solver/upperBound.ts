import type { AxialCoord } from '../coords/axial'
import type { DistrictType } from '../model/district'
import { type HexMap, isRiverAdjacent, neighborTiles } from '../model/map'
import { isWater } from '../model/terrain'
import type { YieldType } from '../model/yield'
import { totalAdjacencyScore } from '../rules/adjacency'
import type { AdjacencyRule, DistrictRuleset } from '../rules/adjacencyRules'
import { canPlace } from '../rules/placement'
import { candidateCoords } from './candidate'

type Weights = Readonly<Partial<Record<YieldType, number>>> | undefined

function weightOf(weights: Weights, y: YieldType): number {
  return weights === undefined ? 1 : (weights[y] ?? 0)
}

function maxWeight(weights: Weights): number {
  if (weights === undefined) return 1
  const values = Object.values(weights).filter((v): v is number => v !== undefined)
  return values.length === 0 ? 0 : Math.max(0, ...values)
}

/**
 * 1 つの区域を新たに隣接させたとき、隣接区域が受け取りうる最大ボーナス量。
 * anyDistrict(Minor)だけでなく、districtType 指定の給付(政府複合施設 +1、
 * 港→商業ハブ +2、水道→工業地帯 +2 など)も含めて上界を取る。
 */
function maxGivingAmount(rules: DistrictRuleset): number {
  let m = 0
  for (const districtRules of Object.values(rules)) {
    for (const rule of districtRules) {
      if (rule.source.kind === 'anyDistrict' || rule.source.kind === 'districtType') {
        m = Math.max(m, rule.amountPerMatch)
      }
    }
  }
  return m
}

/**
 * 1 本のルールの楽観的最大寄与(分数のまま)。
 * - 地形/河川など固定の発生源は実際の値(増えない)
 * - anyDistrict は将来 6 近傍すべてが区域になりうると仮定して最大化
 */
function optimisticRule(map: HexMap, at: AxialCoord, rule: AdjacencyRule): number {
  if (rule.source.kind === 'anyDistrict') {
    return rule.counting === 'onceIfAnyPresent' ? rule.amountPerMatch : rule.amountPerMatch * 6
  }
  if (rule.source.kind === 'river') {
    return isRiverAdjacent(map, at) ? rule.amountPerMatch : 0
  }
  // 地形系: 近傍は固定なので実数(将来増えない)。neighborTiles を直接数える。
  const count = neighborTiles(map, at).filter((t) => matchesFixed(rule, t)).length
  if (rule.counting === 'onceIfAnyPresent') return count > 0 ? rule.amountPerMatch : 0
  return count * rule.amountPerMatch
}

import type { Tile } from '../model/tile'

function matchesFixed(rule: AdjacencyRule, tile: Tile): boolean {
  const s = rule.source
  switch (s.kind) {
    case 'terrain':
      return tile.terrain === s.terrain
    case 'feature':
      return tile.feature === s.feature
    case 'improvement':
      return tile.improvement === s.improvement
    case 'coast':
      return tile.terrain === 'coast'
    case 'worldWonder':
      return tile.hasWorldWonder
    case 'coastalResource':
      return tile.resource !== null && isWater(tile.terrain)
    case 'resourceClass':
      return tile.resource?.resourceClass === s.resourceClass
    case 'districtType':
      return tile.district === s.district
    default:
      return false
  }
}

/** 区域 d を tile t に置いたときの楽観的スコア(重み付き、floor しない)。 */
function optimisticDistrictScore(
  map: HexMap,
  at: AxialCoord,
  d: DistrictType,
  rules: DistrictRuleset,
  weights: Weights,
): number {
  let score = 0
  for (const rule of rules[d]) {
    score += optimisticRule(map, at, rule) * weightOf(weights, rule.yieldType)
  }
  return score
}

/** 区域 d を現在のマップ上のどこかに置いたときの楽観的最大スコア。 */
function bestStandalone(
  map: HexMap,
  d: DistrictType,
  rules: DistrictRuleset,
  weights: Weights,
): number {
  let best = 0
  for (const c of candidateCoords(map)) {
    if (!canPlace(map, c, d)) continue
    best = Math.max(best, optimisticDistrictScore(map, c, d, rules, weights))
  }
  return best
}

/**
 * 部分配置 map と残り区域 remaining から、到達しうる最終スコアの上界(admissible)。
 * 真の最適 ≤ この値 を保証するため、枝刈りは安全。
 */
export function upperBound(
  map: HexMap,
  remaining: readonly DistrictType[],
  rules: DistrictRuleset,
  weights: Weights,
): number {
  const current = totalAdjacencyScore(map, rules, weights)
  let bound = current
  // 各残り区域が単独で得られる楽観的最大(受け取り側)
  for (const d of remaining) {
    bound += bestStandalone(map, d, rules, weights)
  }
  // 将来配置が既存/他区域へ与える隣接ボーナスの余裕(与え手側)。
  // anyDistrict(0.5)に限らず districtType 給付(最大 +2)まで見込んで admissible に保つ。
  bound += remaining.length * 6 * maxGivingAmount(rules) * maxWeight(weights)
  return bound
}
