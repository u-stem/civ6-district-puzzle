import { type AxialCoord, axialKey } from './axial'
import { neighbors } from './neighbors'

/**
 * ヘックスの辺。川・海岸は「タイル属性」ではなく隣接 2 タイルの間の辺で表す。
 * 2 座標を正規化した順序対として持ち、辺キーは方向に依存しない。
 */
export type HexEdge = {
  readonly a: AxialCoord
  readonly b: AxialCoord
}

/** 2 座標を辞書順で正規化した辺キー。a→b と b→a は同一キーになる。 */
export function edgeKey(a: AxialCoord, b: AxialCoord): string {
  const ka = axialKey(a)
  const kb = axialKey(b)
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}

/** タイルが接する 6 辺のキーを返す(隣接 6 タイルとの境界)。 */
export function tileEdgeKeys(c: AxialCoord): readonly string[] {
  return neighbors(c).map((n) => edgeKey(c, n))
}
