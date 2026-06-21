import { describe, expect, it } from 'vitest'
import { isDistrictType, isImprovement, isTerrain, isTerrainFeature } from './guards'

describe('型ガード', () => {
  it('isTerrain', () => {
    expect(isTerrain('mountain')).toBe(true)
    expect(isTerrain('volcano')).toBe(false)
    expect(isTerrain(42)).toBe(false)
    expect(isTerrain(null)).toBe(false)
  })

  it('isTerrainFeature', () => {
    expect(isTerrainFeature('rainforest')).toBe(true)
    expect(isTerrainFeature('geothermalFissure')).toBe(false)
  })

  it('isImprovement', () => {
    expect(isImprovement('mine')).toBe(true)
    expect(isImprovement('nuke')).toBe(false)
  })

  it('isDistrictType', () => {
    expect(isDistrictType('campus')).toBe(true)
    expect(isDistrictType('dam')).toBe(false)
  })
})
