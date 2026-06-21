import type { AxialCoord } from '../coords/axial'
import type { DistrictType } from './district'
import type { Improvement, Resource, Terrain, TerrainFeature } from './terrain'

/**
 * マップ上の 1 タイル。地形・フィーチャー・資源・地形改善・配置区域を持つ。
 * 世界遺産は劇場広場などの隣接対象になるためフラグで保持する。
 */
export type Tile = {
  readonly coord: AxialCoord
  readonly terrain: Terrain
  readonly feature: TerrainFeature | null
  readonly resource: Resource | null
  readonly improvement: Improvement | null
  readonly hasWorldWonder: boolean
  readonly district: DistrictType | null
}
