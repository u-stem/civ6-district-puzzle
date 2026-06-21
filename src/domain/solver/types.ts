import type { AxialCoord } from '../coords/axial'
import type { DistrictType } from '../model/district'
import type { HexMap } from '../model/map'
import type { YieldType } from '../model/yield'
import type { DistrictRuleset } from '../rules/adjacencyRules'

/** ソルバーへの入力。地形は固定し、districts を最適配置する。 */
export type SolveInput = {
  readonly map: HexMap
  /** 配置したい区域(重複可。例: campus を 2 つ等)。 */
  readonly districts: readonly DistrictType[]
  readonly rules: DistrictRuleset
  /** 目的イールドの重み(未指定なら全イールド等価)。 */
  readonly weights?: Readonly<Partial<Record<YieldType, number>>>
}

/** 1 区域の配置結果。 */
export type Placement = {
  readonly district: DistrictType
  readonly coord: AxialCoord
}

/** ソルバーの出力。 */
export type SolveResult = {
  readonly placements: readonly Placement[]
  readonly score: number
  /** 全配置を適用した最終マップ。 */
  readonly map: HexMap
  /** 評価した葉(全区域配置)の数。厳密/高速で意味を揃えた性能指標。 */
  readonly nodesExplored: number
}
