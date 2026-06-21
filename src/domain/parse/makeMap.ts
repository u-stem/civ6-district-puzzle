import { type AxialCoord, axialKey, makeAxial } from '../coords/axial'
import { hexDistance } from '../coords/neighbors'
import type { HexMap } from '../model/map'
import type { Tile } from '../model/tile'
import { makeTile } from './makeTile'

/**
 * 都心を中心とした半径 radius の六角形フィールドの座標を列挙する。
 * 区域の作業範囲は通常半径 3。
 */
export function hexField(center: AxialCoord, radius: number): readonly AxialCoord[] {
  const coords: AxialCoord[] = []
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = -radius; dr <= radius; dr++) {
      const c = makeAxial(center.q + dq, center.r + dr)
      if (hexDistance(center, c) <= radius) coords.push(c)
    }
  }
  return coords
}

/**
 * 半径 radius の草原フィールドに都心を置いた初期マップを生成する。
 * テストや MVP のサンプルマップの土台。
 */
export function makeBlankMap(center: AxialCoord, radius: number): HexMap {
  const tiles = new Map<string, Tile>()
  for (const coord of hexField(center, radius)) {
    const district = axialKey(coord) === axialKey(center) ? 'cityCenter' : null
    tiles.set(axialKey(coord), makeTile({ coord, terrain: 'grassland', district }))
  }
  return { tiles, rivers: new Set(), cityCenter: center }
}
