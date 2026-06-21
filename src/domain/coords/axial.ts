import type { CubeCoord } from './cube'

/**
 * 軸座標(axial coordinate)。マップの保存形式。
 *
 * branded type にして生の `{ q, r }` の混入を防ぐ。生成は必ず検証付きの
 * {@link makeAxial} を経由する(`as` 断言は使わない方針)。
 */
const AxialBrand: unique symbol = Symbol('AxialCoord')
export type AxialCoord = {
  readonly q: number
  readonly r: number
  readonly [AxialBrand]: true
}

/** 整数検証付きの AxialCoord コンストラクタ。 */
export function makeAxial(q: number, r: number): AxialCoord {
  if (!Number.isInteger(q) || !Number.isInteger(r)) {
    throw new RangeError(`axial coordinate must be integers: q=${q}, r=${r}`)
  }
  return { q, r, [AxialBrand]: true }
}

/** マップの ReadonlyMap のキーに使う安定文字列。 */
export function axialKey(c: AxialCoord): string {
  return `${c.q},${c.r}`
}

/** axial → cube 変換(flat-top, x = q, z = r, y = -x - z)。 */
export function axialToCube(c: AxialCoord): CubeCoord {
  const x = c.q
  const z = c.r
  return { x, y: -x - z, z }
}

/** cube → axial 変換。 */
export function cubeToAxial(c: CubeCoord): AxialCoord {
  return makeAxial(c.x, c.z)
}
