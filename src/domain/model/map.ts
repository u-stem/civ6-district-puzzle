import { type AxialCoord, axialKey } from '../coords/axial'
import { edgeKey, tileEdgeKeys } from '../coords/edge'
import { neighbors } from '../coords/neighbors'
import type { Tile } from './tile'

/**
 * 中心となるマップ状態。Single source of truth。
 * - tiles: axialKey をキーにしたタイル集合
 * - rivers: 川の通る辺キー集合(辺ベースで川を表す)
 * - cityCenter: 都心座標。区域配置の作業範囲(半径 3)の基準
 */
export type HexMap = {
  readonly tiles: ReadonlyMap<string, Tile>
  readonly rivers: ReadonlySet<string>
  readonly cityCenter: AxialCoord
}

/** 座標のタイルを取得(無ければ undefined)。 */
export function tileAt(map: HexMap, c: AxialCoord): Tile | undefined {
  return map.tiles.get(axialKey(c))
}

/** タイルを差し替えた新しいマップを返す(イミュータブル更新)。 */
export function withTile(map: HexMap, tile: Tile): HexMap {
  const tiles = new Map(map.tiles)
  tiles.set(axialKey(tile.coord), tile)
  return { ...map, tiles }
}

/** 存在する近傍タイルだけを返す。 */
export function neighborTiles(map: HexMap, c: AxialCoord): readonly Tile[] {
  const result: Tile[] = []
  for (const n of neighbors(c)) {
    const t = map.tiles.get(axialKey(n))
    if (t !== undefined) result.push(t)
  }
  return result
}

/** 指定タイルが川に接しているか(6 辺のいずれかが川集合に含まれる)。 */
export function isRiverAdjacent(map: HexMap, c: AxialCoord): boolean {
  return tileEdgeKeys(c).some((k) => map.rivers.has(k))
}

/** 2 タイル間の特定の辺に川があるか。 */
export function hasRiverEdge(map: HexMap, a: AxialCoord, b: AxialCoord): boolean {
  return map.rivers.has(edgeKey(a, b))
}

/** c が川に接しているか。ただし c と exclude が共有する辺は除外する。 */
export function isRiverAdjacentExcept(map: HexMap, c: AxialCoord, exclude: AxialCoord): boolean {
  const excluded = edgeKey(c, exclude)
  return tileEdgeKeys(c).some((k) => k !== excluded && map.rivers.has(k))
}

/** 2 タイル間の辺に川を引いた(あるいは消した)新しいマップを返す。 */
export function withRiverEdge(map: HexMap, a: AxialCoord, b: AxialCoord, present: boolean): HexMap {
  const rivers = new Set(map.rivers)
  const key = edgeKey(a, b)
  if (present) rivers.add(key)
  else rivers.delete(key)
  return { ...map, rivers }
}
