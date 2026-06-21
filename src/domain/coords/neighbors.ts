import { type AxialCoord, axialToCube, cubeToAxial } from './axial'
import { type CubeCoord, cubeDistance } from './cube'

/** flat-top ヘックスの 6 近傍方向(cube ベクトル)。 */
const CUBE_DIRECTIONS: readonly CubeCoord[] = [
  { x: 1, y: -1, z: 0 },
  { x: 1, y: 0, z: -1 },
  { x: 0, y: 1, z: -1 },
  { x: -1, y: 1, z: 0 },
  { x: -1, y: 0, z: 1 },
  { x: 0, y: -1, z: 1 },
]

/** 与えた座標の 6 近傍を返す(常に 6 要素、順序は CUBE_DIRECTIONS 準拠)。 */
export function neighbors(c: AxialCoord): readonly AxialCoord[] {
  const cube = axialToCube(c)
  return CUBE_DIRECTIONS.map((d) =>
    cubeToAxial({ x: cube.x + d.x, y: cube.y + d.y, z: cube.z + d.z }),
  )
}

/** 2 つの軸座標間のヘックス距離。 */
export function hexDistance(a: AxialCoord, b: AxialCoord): number {
  return cubeDistance(axialToCube(a), axialToCube(b))
}
