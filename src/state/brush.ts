import type { DistrictType } from '@/domain/model/district'
import type { Improvement, Terrain, TerrainFeature } from '@/domain/model/terrain'

/**
 * エディタのブラシ(ペイント道具)。タイルをクリックすると適用される。
 * river は辺ベースのため Phase 3 で別経路として扱う。
 */
export type Brush =
  | { readonly kind: 'inspect' }
  | { readonly kind: 'erase' }
  | { readonly kind: 'district'; readonly district: DistrictType }
  | { readonly kind: 'terrain'; readonly terrain: Terrain }
  | { readonly kind: 'feature'; readonly feature: TerrainFeature }
  | { readonly kind: 'improvement'; readonly improvement: Improvement }
  | { readonly kind: 'worldWonder' }
  | { readonly kind: 'river' }
