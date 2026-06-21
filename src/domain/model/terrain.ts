/** 基本地形。Civ6 の base terrain(+ 海岸/海洋/湖)。 */
export type Terrain =
  | 'grassland'
  | 'plains'
  | 'desert'
  | 'tundra'
  | 'snow'
  | 'coast'
  | 'ocean'
  | 'lake'
  | 'mountain'

export const TERRAINS: readonly Terrain[] = [
  'grassland',
  'plains',
  'desert',
  'tundra',
  'snow',
  'coast',
  'ocean',
  'lake',
  'mountain',
]

/** 陸地かどうか(区域の多くは陸地のみ配置可)。 */
export function isLand(t: Terrain): boolean {
  return t !== 'coast' && t !== 'ocean' && t !== 'lake'
}

/** 区域配置できない地形(山岳・海洋系)。 */
export function isWater(t: Terrain): boolean {
  return t === 'coast' || t === 'ocean' || t === 'lake'
}

/**
 * 地形フィーチャー。R&F までに登場するもの。
 * GS 固有(geothermalFissure 等)は含めない。naturalWonder は隣接対象。
 */
export type TerrainFeature =
  | 'woods'
  | 'rainforest'
  | 'marsh'
  | 'floodplains'
  | 'oasis'
  | 'reef'
  | 'iceFloe'
  | 'naturalWonder'

export const TERRAIN_FEATURES: readonly TerrainFeature[] = [
  'woods',
  'rainforest',
  'marsh',
  'floodplains',
  'oasis',
  'reef',
  'iceFloe',
  'naturalWonder',
]

/**
 * 地形改善(隣接ボーナスの対象になるもの)。工業地帯が参照する鉱山/採石場など。
 */
export type Improvement = 'mine' | 'quarry' | 'lumberMill' | 'farm' | 'pasture' | 'fishingBoats'

export const IMPROVEMENTS: readonly Improvement[] = [
  'mine',
  'quarry',
  'lumberMill',
  'farm',
  'pasture',
  'fishingBoats',
]

/** 資源の区分。 */
export type ResourceClass = 'bonus' | 'luxury' | 'strategic'

export type Resource = {
  readonly name: string
  readonly resourceClass: ResourceClass
}
