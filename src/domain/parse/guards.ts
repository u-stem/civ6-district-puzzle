import { DISTRICT_TYPES, type DistrictType } from '../model/district'
import {
  IMPROVEMENTS,
  type Improvement,
  TERRAIN_FEATURES,
  TERRAINS,
  type Terrain,
  type TerrainFeature,
} from '../model/terrain'

/**
 * 文字列ユニオンの型ガード。`as` 断言の代替として、外部入力
 * (JSON / Worker / DOM dataset)を安全に絞り込むために使う。
 */
function isMember<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && list.some((member) => member === value)
}

export function isTerrain(value: unknown): value is Terrain {
  return isMember(TERRAINS, value)
}

export function isTerrainFeature(value: unknown): value is TerrainFeature {
  return isMember(TERRAIN_FEATURES, value)
}

export function isImprovement(value: unknown): value is Improvement {
  return isMember(IMPROVEMENTS, value)
}

export function isDistrictType(value: unknown): value is DistrictType {
  return isMember(DISTRICT_TYPES, value)
}
