import { describe, expect, it } from 'vitest'
import { cubeDistance } from './cube'

describe('cubeDistance', () => {
  it('同一座標の距離は 0', () => {
    expect(cubeDistance({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(0)
  })

  it('隣接する座標の距離は 1', () => {
    expect(cubeDistance({ x: 0, y: 0, z: 0 }, { x: 1, y: -1, z: 0 })).toBe(1)
  })

  it('2 つ離れた座標の距離は 2', () => {
    expect(cubeDistance({ x: 0, y: 0, z: 0 }, { x: 2, y: -2, z: 0 })).toBe(2)
  })
})
