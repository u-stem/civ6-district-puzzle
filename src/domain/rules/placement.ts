import type { AxialCoord } from '../coords/axial'
import { hexDistance } from '../coords/neighbors'
import type { DistrictType } from '../model/district'
import { type HexMap, isRiverAdjacentExcept, neighborTiles, tileAt } from '../model/map'
import { isWater } from '../model/terrain'
import type { Tile } from '../model/tile'

/** 区域を建設できる作業範囲(都心からの半径)。 */
export const WORK_RADIUS = 3

/** 都心に隣接しているか。 */
function isAdjacentToCityCenter(map: HexMap, c: AxialCoord): boolean {
  return neighborTiles(map, c).some((t) => t.district === 'cityCenter')
}

/** 水域(港)区域か。港のみ水上に建設する。 */
function isWaterDistrict(d: DistrictType): boolean {
  return d === 'harbor'
}

/** タイル単体の地形が区域 d を受け入れられるか(占有・遺産・範囲は別途判定)。 */
function terrainAllows(map: HexMap, tile: Tile, d: DistrictType): boolean {
  if (isWaterDistrict(d)) {
    // 港: 海岸または湖タイルで、陸に隣接していること。リーフ上には建設不可。
    if (tile.terrain !== 'coast' && tile.terrain !== 'lake') return false
    if (tile.feature === 'reef') return false
    return neighborTiles(map, tile.coord).some((t) => !isWater(t.terrain))
  }

  // 陸上区域: 山岳・水域・自然遺産タイルには建設不可
  if (tile.terrain === 'mountain' || isWater(tile.terrain)) return false
  if (tile.feature === 'naturalWonder') return false

  switch (d) {
    case 'encampment':
      // 兵営は都心に隣接するタイルには建設できない
      return !isAdjacentToCityCenter(map, tile.coord)
    case 'aqueduct':
      // 都心に隣接し、かつ山岳/河川/湖/オアシスに隣接。
      // 河川を水源とする場合、都心と共有する辺の川は数えない。
      return (
        isAdjacentToCityCenter(map, tile.coord) &&
        (isRiverAdjacentExcept(map, tile.coord, map.cityCenter) ||
          neighborTiles(map, tile.coord).some(
            (t) => t.terrain === 'mountain' || t.terrain === 'lake' || t.feature === 'oasis',
          ))
      )
    case 'aerodrome':
    case 'spaceport':
      // 平坦地のみ(地形フィーチャー不可。丘陵は本モデルでは未区別)
      return tile.feature === null
    default:
      return true
  }
}

/**
 * 区域 d を座標 c に配置できるか。
 * - 作業範囲(半径 3)内
 * - 既存区域・都心・世界遺産が無い
 * - 地形条件を満たす(港は水上、水道は隣接条件 など)
 */
export function canPlace(map: HexMap, c: AxialCoord, d: DistrictType): boolean {
  if (d === 'cityCenter') return false
  const tile = tileAt(map, c)
  if (tile === undefined) return false
  if (tile.district !== null || tile.hasWorldWonder) return false
  if (hexDistance(map.cityCenter, c) > WORK_RADIUS) return false
  return terrainAllows(map, tile, d)
}
