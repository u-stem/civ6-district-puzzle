import { type AxialCoord, axialKey, makeAxial } from '../coords/axial'
import type { HexMap } from '../model/map'
import type { ResourceClass } from '../model/terrain'
import type { Tile } from '../model/tile'
import { isDistrictType, isImprovement, isTerrain, isTerrainFeature } from './guards'
import { makeTile } from './makeTile'

/**
 * 構造化複製/JSON 境界(Worker・URL 共有)を越えるための plain 形式。
 * branded 型や Map/Set を含まず、安全に復元できる。
 */
export type SerializedMap = {
  readonly tiles: readonly SerializedTile[]
  readonly rivers: readonly string[]
  readonly cityCenter: { readonly q: number; readonly r: number }
}

type SerializedTile = {
  readonly q: number
  readonly r: number
  readonly terrain: string
  readonly feature: string | null
  readonly improvement: string | null
  readonly resource: { readonly name: string; readonly resourceClass: ResourceClass } | null
  readonly hasWorldWonder: boolean
  readonly district: string | null
}

export function serializeMap(map: HexMap): SerializedMap {
  const tiles: SerializedTile[] = []
  for (const t of map.tiles.values()) {
    tiles.push({
      q: t.coord.q,
      r: t.coord.r,
      terrain: t.terrain,
      feature: t.feature,
      improvement: t.improvement,
      resource: t.resource,
      hasWorldWonder: t.hasWorldWonder,
      district: t.district,
    })
  }
  return {
    tiles,
    rivers: [...map.rivers],
    cityCenter: { q: map.cityCenter.q, r: map.cityCenter.r },
  }
}

function resourceClass(value: unknown): ResourceClass | null {
  return value === 'bonus' || value === 'luxury' || value === 'strategic' ? value : null
}

/** plain 形式から HexMap を復元する(型ガードで検証、不正値は安全に無視)。 */
export function deserializeMap(data: SerializedMap): HexMap {
  const tiles = new Map<string, Tile>()
  for (const s of data.tiles) {
    if (!isTerrain(s.terrain)) continue
    const coord = makeAxial(s.q, s.r)
    const tile = makeTile({
      coord,
      terrain: s.terrain,
      feature: isTerrainFeature(s.feature) ? s.feature : null,
      improvement: isImprovement(s.improvement) ? s.improvement : null,
      resource:
        s.resource !== null && resourceClass(s.resource.resourceClass) !== null
          ? { name: s.resource.name, resourceClass: s.resource.resourceClass }
          : null,
      hasWorldWonder: s.hasWorldWonder === true,
      district: isDistrictType(s.district) ? s.district : null,
    })
    tiles.set(axialKey(coord), tile)
  }
  return {
    tiles,
    rivers: new Set(data.rivers),
    cityCenter: makeAxial(data.cityCenter.q, data.cityCenter.r),
  }
}

/** AxialCoord を plain に。 */
export function serializeCoord(c: AxialCoord): { q: number; r: number } {
  return { q: c.q, r: c.r }
}
