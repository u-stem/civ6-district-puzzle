/**
 * 区域種別。R&F(文明の興亡)までに登場するもの。
 * GS 固有(dam / canal / waterPark)は含めない。
 */
export type DistrictType =
  | 'cityCenter'
  | 'campus'
  | 'holySite'
  | 'theaterSquare'
  | 'commercialHub'
  | 'harbor'
  | 'industrialZone'
  | 'encampment'
  | 'entertainmentComplex'
  | 'aqueduct'
  | 'neighborhood'
  | 'governmentPlaza'
  | 'aerodrome'
  | 'spaceport'

export const DISTRICT_TYPES: readonly DistrictType[] = [
  'cityCenter',
  'campus',
  'holySite',
  'theaterSquare',
  'commercialHub',
  'harbor',
  'industrialZone',
  'encampment',
  'entertainmentComplex',
  'aqueduct',
  'neighborhood',
  'governmentPlaza',
  'aerodrome',
  'spaceport',
]

/** 都心は専用区域(自動配置)。プレイヤーが配置するのは specialty 等。 */
export function isCityCenter(d: DistrictType): boolean {
  return d === 'cityCenter'
}
