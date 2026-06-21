import type { AxialCoord } from '../coords/axial'
import type { DistrictType } from '../model/district'
import { type HexMap, hasRiverEdge, tileAt, withRiverEdge, withTile } from '../model/map'
import type { Improvement, Terrain, TerrainFeature } from '../model/terrain'
import { makeTile } from '../parse/makeTile'
import { canPlace } from '../rules/placement'

/**
 * タイル単位のブラシ操作の純粋実装。React 非依存でテスト可能。
 * 適用できない場合は map をそのまま返す(no-op)。
 */
export type TileBrushOp =
  | { readonly kind: 'erase' }
  | { readonly kind: 'district'; readonly district: DistrictType }
  | { readonly kind: 'terrain'; readonly terrain: Terrain }
  | { readonly kind: 'feature'; readonly feature: TerrainFeature }
  | { readonly kind: 'improvement'; readonly improvement: Improvement }
  | { readonly kind: 'worldWonder' }

/** ブラシ操作をタイルに適用した新しいマップを返す(都心は編集不可)。 */
export function applyTileBrush(map: HexMap, c: AxialCoord, op: TileBrushOp): HexMap {
  const tile = tileAt(map, c)
  if (tile === undefined) return map
  if (tile.district === 'cityCenter') return map

  switch (op.kind) {
    case 'erase':
      return withTile(map, makeTile({ coord: c, terrain: tile.terrain }))
    case 'district':
      if (!canPlace(map, c, op.district)) return map
      return withTile(map, makeTile({ ...tile, district: op.district }))
    case 'terrain':
      return withTile(map, makeTile({ ...tile, terrain: op.terrain }))
    case 'feature':
      return withTile(map, makeTile({ ...tile, feature: op.feature }))
    case 'improvement':
      return withTile(map, makeTile({ ...tile, improvement: op.improvement }))
    case 'worldWonder':
      return withTile(map, makeTile({ ...tile, district: null, hasWorldWonder: true }))
  }
}

/** 2 タイル間の川をトグルする(その辺の有無を反転)。 */
export function toggleRiver(map: HexMap, a: AxialCoord, b: AxialCoord): HexMap {
  return withRiverEdge(map, a, b, !hasRiverEdge(map, a, b))
}
