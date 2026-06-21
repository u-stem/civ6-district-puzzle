import type { DistrictType } from '@/domain/model/district'
import type { Improvement, ResourceClass, Terrain, TerrainFeature } from '@/domain/model/terrain'
import type { YieldType } from '@/domain/model/yield'
import type { AdjacencySource } from '@/domain/rules/adjacencyRules'

const RESOURCE_CLASS_LABELS: Readonly<Record<ResourceClass, string>> = {
  bonus: 'ボーナス資源',
  luxury: '高級資源',
  strategic: '戦略資源',
}

/** 地形の塗り色。 */
export const TERRAIN_COLORS: Readonly<Record<Terrain, string>> = {
  grassland: '#7fae5a',
  plains: '#c8b560',
  desert: '#e3cf86',
  tundra: '#cdd3c2',
  snow: '#eef2f5',
  coast: '#74c0e8',
  ocean: '#2f6fb0',
  lake: '#69b6e0',
  mountain: '#8a8076',
}

export const TERRAIN_LABELS: Readonly<Record<Terrain, string>> = {
  grassland: '草原',
  plains: '平原',
  desert: '砂漠',
  tundra: 'ツンドラ',
  snow: '雪原',
  coast: '海岸',
  ocean: '海洋',
  lake: '湖',
  mountain: '山岳',
}

export const FEATURE_LABELS: Readonly<Record<TerrainFeature, string>> = {
  woods: '森林',
  rainforest: '熱帯雨林',
  marsh: '湿原',
  floodplains: '氾濫原',
  oasis: 'オアシス',
  reef: 'リーフ',
  iceFloe: '氷塊',
  naturalWonder: '自然遺産',
}

export const IMPROVEMENT_LABELS: Readonly<Record<Improvement, string>> = {
  mine: '鉱山',
  quarry: '採石場',
  lumberMill: '製材所',
  farm: '農場',
  pasture: '牧草地',
  fishingBoats: '漁船',
}

/** 区域の塗り色と短縮ラベル。 */
export const DISTRICT_COLORS: Readonly<Record<DistrictType, string>> = {
  cityCenter: '#b5651d',
  campus: '#2f80ed',
  holySite: '#f2c94c',
  theaterSquare: '#9b51e0',
  commercialHub: '#f2994a',
  harbor: '#56ccf2',
  industrialZone: '#828282',
  encampment: '#eb5757',
  entertainmentComplex: '#bb6bd9',
  aqueduct: '#2d9cdb',
  neighborhood: '#6fcf97',
  governmentPlaza: '#bda55d',
  aerodrome: '#4f4f4f',
  spaceport: '#219653',
}

export const DISTRICT_LABELS: Readonly<Record<DistrictType, string>> = {
  cityCenter: '都心',
  campus: 'キャンパス',
  holySite: '聖地',
  theaterSquare: '劇場広場',
  commercialHub: '商業ハブ',
  harbor: '港',
  industrialZone: '工業地帯',
  encampment: '兵営',
  entertainmentComplex: '娯楽施設',
  aqueduct: '水道',
  neighborhood: '近隣住区',
  governmentPlaza: '政府複合施設',
  aerodrome: '飛行場',
  spaceport: '宇宙基地',
}

export const YIELD_LABELS: Readonly<Record<YieldType, string>> = {
  food: '食料',
  production: '生産力',
  gold: 'ゴールド',
  science: '科学',
  culture: '文化',
  faith: '信仰',
  housing: '住宅',
  amenities: '快適性',
}

/**
 * 背景色 `#rrggbb` に対して読みやすい文字色(濃いめ or 白)を返す。
 * 相対輝度がしきい値より高い(淡い)背景には濃い文字を使う。
 */
export function textColorFor(background: string): string {
  const hex = background.replace('#', '')
  if (hex.length !== 6) return '#111'
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#111' : '#fff'
}

/** 隣接ボーナスの発生源を日本語で説明する(内訳表示用)。 */
export function describeSource(source: AdjacencySource): string {
  switch (source.kind) {
    case 'terrain':
      return TERRAIN_LABELS[source.terrain]
    case 'feature':
      return FEATURE_LABELS[source.feature]
    case 'improvement':
      return IMPROVEMENT_LABELS[source.improvement]
    case 'river':
      return '河川'
    case 'coast':
      return '海岸'
    case 'anyDistrict':
      return '隣接区域'
    case 'districtType':
      return DISTRICT_LABELS[source.district]
    case 'worldWonder':
      return '世界遺産'
    case 'coastalResource':
      return '沿岸資源'
    case 'resourceClass':
      return RESOURCE_CLASS_LABELS[source.resourceClass]
  }
}

export const YIELD_ICONS: Readonly<Record<YieldType, string>> = {
  food: '🍎',
  production: '⚙️',
  gold: '💰',
  science: '🔬',
  culture: '🎭',
  faith: '✨',
  housing: '🏠',
  amenities: '😊',
}
