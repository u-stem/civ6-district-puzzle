import type { AxialCoord } from '../coords/axial'
import { hexDistance } from '../coords/neighbors'
import type { HexMap } from '../model/map'
import { WORK_RADIUS } from '../rules/placement'

/**
 * 配置対象になりうる空きタイル(区域・世界遺産が無く、作業範囲内)の座標。
 * 港など水上区域も含めるため地形でのフィルタはここでは行わない
 *(個別の可否は canPlace が判定する)。
 */
export function candidateCoords(map: HexMap): readonly AxialCoord[] {
  const result: AxialCoord[] = []
  for (const tile of map.tiles.values()) {
    if (tile.district !== null || tile.hasWorldWonder) continue
    if (hexDistance(map.cityCenter, tile.coord) > WORK_RADIUS) continue
    result.push(tile.coord)
  }
  return result
}
