import type { DistrictType } from '../model/district'
import type { Improvement, ResourceClass, Terrain, TerrainFeature } from '../model/terrain'
import type { YieldType } from '../model/yield'

/**
 * 隣接ボーナスの発生源。区域の隣接ボーナスは「何に隣接しているか」で決まる。
 * river のみ辺ベース(タイルではなく辺集合)で判定する。
 */
export type AdjacencySource =
  | { readonly kind: 'terrain'; readonly terrain: Terrain }
  | { readonly kind: 'feature'; readonly feature: TerrainFeature }
  | { readonly kind: 'improvement'; readonly improvement: Improvement }
  | { readonly kind: 'river' }
  | { readonly kind: 'coast' }
  | { readonly kind: 'anyDistrict' }
  | { readonly kind: 'districtType'; readonly district: DistrictType }
  | { readonly kind: 'worldWonder' }
  | { readonly kind: 'coastalResource' }
  | { readonly kind: 'resourceClass'; readonly resourceClass: ResourceClass }

/**
 * 1 本の隣接ルール。Civ6 の隣接段階は Major=+2 / Standard=+1 / Minor=+0.5。
 * - counting: perAdjacentTile=対象タイルごとに加算 / onceIfAnyPresent=1 つでもあれば一度だけ
 */
export type AdjacencyRule = {
  readonly source: AdjacencySource
  readonly yieldType: YieldType
  readonly amountPerMatch: 0.5 | 1 | 2
  readonly counting: 'perAdjacentTile' | 'onceIfAnyPresent'
}

/** 区域種別ごとの隣接ルール集合。 */
export type DistrictRuleset = Readonly<Record<DistrictType, readonly AdjacencyRule[]>>

/** Minor(+0.5、タイルごと)。 */
function minor(source: AdjacencySource, yieldType: YieldType): AdjacencyRule {
  return { source, yieldType, amountPerMatch: 0.5, counting: 'perAdjacentTile' }
}

/** Standard(+1、タイルごと)。 */
function standard(source: AdjacencySource, yieldType: YieldType): AdjacencyRule {
  return { source, yieldType, amountPerMatch: 1, counting: 'perAdjacentTile' }
}

/** Major(+2、タイルごと)。 */
function major(source: AdjacencySource, yieldType: YieldType): AdjacencyRule {
  return { source, yieldType, amountPerMatch: 2, counting: 'perAdjacentTile' }
}

/** Major(+2、一度だけ)。商業ハブの河川ボーナス(隣接する川に対して総計 +2)。 */
function majorOnce(source: AdjacencySource, yieldType: YieldType): AdjacencyRule {
  return { source, yieldType, amountPerMatch: 2, counting: 'onceIfAnyPresent' }
}

/** 全区域共通: 隣接する各区域からメインイールドに Minor。 */
function adjacentDistricts(yieldType: YieldType): AdjacencyRule {
  return minor({ kind: 'anyDistrict' }, yieldType)
}

/** 政府複合施設(R&F): 隣接する特産区域へ Standard(+1) を追加付与。 */
function governmentPlazaBonus(yieldType: YieldType): AdjacencyRule {
  return standard({ kind: 'districtType', district: 'governmentPlaza' }, yieldType)
}

/**
 * R&F(文明の興亡)時点の隣接ルール表。
 *
 * 段階定義: Major=+2 / Standard=+1 / Minor=+0.5(出典: Civ6 Fandom "Adjacency bonus")。
 * GS 固有(geothermalFissure / dam / canal / 水域区域 / Reef→Campus 等)は含めない。
 *
 * 設計上の判断(リサーチで確認した曖昧点):
 * - Industrial Zone は 2019/6 パッチ後の値を採用(Aqueduct=Major、Quarry/戦略資源=Standard、
 *   Mine/Lumber Mill=Minor)。GS 機能(Dam/Canal)は除外。
 * - Theater Square の世界遺産は R&F 期の Standard(+1) を採用(GS で Major(+2) 化)。
 * - Reef→Campus(+2) は GS 同期パッチ追加の可能性が高く除外。
 * - Government Plaza は隣接特産区域へ Standard(+1) を追加(汎用 Minor と合算で +1.5)。
 */
export const RF_RULESET: DistrictRuleset = {
  cityCenter: [],
  campus: [
    standard({ kind: 'terrain', terrain: 'mountain' }, 'science'),
    minor({ kind: 'feature', feature: 'rainforest' }, 'science'),
    adjacentDistricts('science'),
    governmentPlazaBonus('science'),
  ],
  holySite: [
    major({ kind: 'feature', feature: 'naturalWonder' }, 'faith'),
    standard({ kind: 'terrain', terrain: 'mountain' }, 'faith'),
    minor({ kind: 'feature', feature: 'woods' }, 'faith'),
    adjacentDistricts('faith'),
    governmentPlazaBonus('faith'),
  ],
  theaterSquare: [
    standard({ kind: 'worldWonder' }, 'culture'),
    adjacentDistricts('culture'),
    governmentPlazaBonus('culture'),
  ],
  commercialHub: [
    majorOnce({ kind: 'river' }, 'gold'),
    major({ kind: 'districtType', district: 'harbor' }, 'gold'),
    adjacentDistricts('gold'),
    governmentPlazaBonus('gold'),
  ],
  harbor: [
    major({ kind: 'districtType', district: 'cityCenter' }, 'gold'),
    standard({ kind: 'coastalResource' }, 'gold'),
    adjacentDistricts('gold'),
    governmentPlazaBonus('gold'),
  ],
  industrialZone: [
    major({ kind: 'districtType', district: 'aqueduct' }, 'production'),
    standard({ kind: 'improvement', improvement: 'quarry' }, 'production'),
    standard({ kind: 'resourceClass', resourceClass: 'strategic' }, 'production'),
    minor({ kind: 'improvement', improvement: 'mine' }, 'production'),
    minor({ kind: 'improvement', improvement: 'lumberMill' }, 'production'),
    adjacentDistricts('production'),
    governmentPlazaBonus('production'),
  ],
  // 以下は固有イールドの隣接ボーナスを受け取らない(隣接区域へ Minor を付与するのみ)。
  encampment: [],
  entertainmentComplex: [],
  aqueduct: [],
  neighborhood: [],
  governmentPlaza: [],
  aerodrome: [],
  spaceport: [],
}
