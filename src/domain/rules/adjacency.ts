import type { AxialCoord } from '../coords/axial'
import { axialKey } from '../coords/axial'
import { type HexMap, isRiverAdjacent, neighborTiles, tileAt } from '../model/map'
import { isWater } from '../model/terrain'
import type { Tile } from '../model/tile'
import { addYield, YIELD_TYPES, type YieldBonus, type YieldType } from '../model/yield'
import type { AdjacencyRule, AdjacencySource, DistrictRuleset } from './adjacencyRules'

/** 1 つの近傍タイルが発生源にマッチするか(river は別経路で扱う)。 */
function tileMatches(source: AdjacencySource, tile: Tile): boolean {
  switch (source.kind) {
    case 'terrain':
      return tile.terrain === source.terrain
    case 'feature':
      return tile.feature === source.feature
    case 'improvement':
      return tile.improvement === source.improvement
    case 'coast':
      return tile.terrain === 'coast'
    case 'anyDistrict':
      return tile.district !== null
    case 'districtType':
      return tile.district === source.district
    case 'worldWonder':
      return tile.hasWorldWonder
    case 'coastalResource':
      return tile.resource !== null && isWater(tile.terrain)
    case 'resourceClass':
      return tile.resource?.resourceClass === source.resourceClass
    case 'river':
      return false
  }
}

/**
 * 1 本のルールの寄与(分数のまま、floor しない)。
 * river は辺ベースで一度だけ判定する。
 */
export function ruleContribution(map: HexMap, at: AxialCoord, rule: AdjacencyRule): number {
  if (rule.source.kind === 'river') {
    return isRiverAdjacent(map, at) ? rule.amountPerMatch : 0
  }
  const matchCount = neighborTiles(map, at).filter((t) => tileMatches(rule.source, t)).length
  if (rule.counting === 'onceIfAnyPresent') {
    return matchCount > 0 ? rule.amountPerMatch : 0
  }
  return matchCount * rule.amountPerMatch
}

/**
 * 1 区域の隣接ボーナス。各イールドで分数を合算し、最後に floor する。
 * floor の境界はこの関数の 1 箇所のみ。
 */
export function computeDistrictBonus(
  map: HexMap,
  at: AxialCoord,
  rules: DistrictRuleset,
): YieldBonus {
  const tile = tileAt(map, at)
  if (tile === undefined || tile.district === null) return {}

  const fractional = new Map<YieldType, number>()
  for (const rule of rules[tile.district]) {
    const contribution = ruleContribution(map, at, rule)
    if (contribution === 0) continue
    fractional.set(rule.yieldType, (fractional.get(rule.yieldType) ?? 0) + contribution)
  }

  let bonus: YieldBonus = {}
  for (const [yieldType, sum] of fractional) {
    const floored = Math.floor(sum)
    if (floored !== 0) bonus = addYield(bonus, yieldType, floored)
  }
  return bonus
}

/** 隣接ボーナスの内訳の 1 行(どのルールがいくつ寄与したか)。 */
export type BonusBreakdownLine = {
  readonly rule: AdjacencyRule
  readonly contribution: number
}

/**
 * 選択区域の内訳。各ルールの寄与(分数)と、floor 後の合計を返す。
 * UI の内訳表示用。
 */
export function explainDistrictBonus(
  map: HexMap,
  at: AxialCoord,
  rules: DistrictRuleset,
): { readonly lines: readonly BonusBreakdownLine[]; readonly total: YieldBonus } {
  const tile = tileAt(map, at)
  if (tile === undefined || tile.district === null) return { lines: [], total: {} }
  const lines: BonusBreakdownLine[] = []
  for (const rule of rules[tile.district]) {
    const contribution = ruleContribution(map, at, rule)
    if (contribution !== 0) lines.push({ rule, contribution })
  }
  return { lines, total: computeDistrictBonus(map, at, rules) }
}

/** マップ上の全区域の隣接ボーナス(axialKey → YieldBonus)。 */
export function computeAllBonuses(
  map: HexMap,
  rules: DistrictRuleset,
): ReadonlyMap<string, YieldBonus> {
  const result = new Map<string, YieldBonus>()
  for (const tile of map.tiles.values()) {
    if (tile.district === null || tile.district === 'cityCenter') continue
    result.set(axialKey(tile.coord), computeDistrictBonus(map, tile.coord, rules))
  }
  return result
}

/**
 * ソルバー用のスカラー目的関数。指定イールドの加重合計(weights 未指定なら全イールド合計)。
 */
export function totalAdjacencyScore(
  map: HexMap,
  rules: DistrictRuleset,
  weights?: Readonly<Partial<Record<YieldType, number>>>,
): number {
  let total = 0
  for (const bonus of computeAllBonuses(map, rules).values()) {
    for (const yieldType of YIELD_TYPES) {
      const amount = bonus[yieldType]
      if (amount === undefined) continue
      const weight = weights === undefined ? 1 : (weights[yieldType] ?? 0)
      total += amount * weight
    }
  }
  return total
}
