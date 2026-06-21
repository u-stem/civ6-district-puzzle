import type { AxialCoord } from '../coords/axial'
import type { DistrictType } from '../model/district'
import type { Improvement, Resource, Terrain, TerrainFeature } from '../model/terrain'
import type { Tile } from '../model/tile'

export type TileInit = {
  readonly coord: AxialCoord
  readonly terrain: Terrain
  readonly feature?: TerrainFeature | null
  readonly resource?: Resource | null
  readonly improvement?: Improvement | null
  readonly hasWorldWonder?: boolean
  readonly district?: DistrictType | null
}

/** 既定値を補ってタイルを生成する。 */
export function makeTile(init: TileInit): Tile {
  return {
    coord: init.coord,
    terrain: init.terrain,
    feature: init.feature ?? null,
    resource: init.resource ?? null,
    improvement: init.improvement ?? null,
    hasWorldWonder: init.hasWorldWonder ?? false,
    district: init.district ?? null,
  }
}
