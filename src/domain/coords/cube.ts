/**
 * キューブ座標(x + y + z = 0)。距離・近傍計算に用いる内部表現。
 * 保存形式は axial(q/r)で、計算時のみ cube へ変換する。
 */
export type CubeCoord = {
  readonly x: number
  readonly y: number
  readonly z: number
}

/** 2 つのキューブ座標間のヘックス距離。 */
export function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2
}
