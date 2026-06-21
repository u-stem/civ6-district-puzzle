import type { DistrictType } from '@/domain/model/district'
import type { YieldType } from '@/domain/model/yield'
import type { SerializedMap } from '@/domain/parse/serialize'
import type { SolverMode } from '@/domain/solver/solver'

/** Worker への依頼。map は plain 形式(構造化複製で brand が落ちるため)。 */
export type SolveRequest = {
  /** リクエスト識別子。古い応答を破棄するために使う。 */
  readonly id: number
  readonly map: SerializedMap
  readonly districts: readonly DistrictType[]
  readonly mode: SolverMode
  readonly weights?: Readonly<Partial<Record<YieldType, number>>>
}

/** Worker からの応答。配置は plain 座標で返す。 */
export type SolveResponse = {
  readonly id: number
  readonly placements: readonly {
    readonly district: DistrictType
    readonly q: number
    readonly r: number
  }[]
  readonly score: number
  readonly nodesExplored: number
}

/** unknown を SolveRequest として検証する型ガード(Worker 境界)。 */
export function isSolveRequest(value: unknown): value is SolveRequest {
  if (typeof value !== 'object' || value === null) return false
  const id = Reflect.get(value, 'id')
  const map = Reflect.get(value, 'map')
  const districts = Reflect.get(value, 'districts')
  const mode = Reflect.get(value, 'mode')
  if (typeof id !== 'number' || typeof map !== 'object' || map === null) return false
  if (!Array.isArray(districts)) return false
  if (mode !== 'exact' && mode !== 'fast') return false
  // map.tiles / map.rivers が配列であることまで確認する(deserialize の前提)。
  return Array.isArray(Reflect.get(map, 'tiles')) && Array.isArray(Reflect.get(map, 'rivers'))
}

/** unknown を SolveResponse として検証する型ガード。 */
export function isSolveResponse(value: unknown): value is SolveResponse {
  if (typeof value !== 'object' || value === null) return false
  return (
    typeof Reflect.get(value, 'id') === 'number' &&
    Array.isArray(Reflect.get(value, 'placements')) &&
    typeof Reflect.get(value, 'score') === 'number'
  )
}
