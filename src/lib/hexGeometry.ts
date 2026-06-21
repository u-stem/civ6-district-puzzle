import type { AxialCoord } from '@/domain/coords/axial'

/** SVG 上の点。 */
export type Point = { readonly x: number; readonly y: number }

/**
 * flat-top ヘックスのレイアウト。size はヘックスの中心から頂点までの距離。
 */
export type HexLayout = {
  readonly size: number
  readonly origin: Point
}

export function makeLayout(size: number, origin: Point = { x: 0, y: 0 }): HexLayout {
  return { size, origin }
}

/** flat-top ヘックスの 1 タイルの幅と高さ。 */
export function hexDimensions(size: number): { width: number; height: number } {
  return { width: 2 * size, height: Math.sqrt(3) * size }
}

/** axial 座標 → ヘックス中心のピクセル座標(flat-top)。 */
export function hexToPixel(layout: HexLayout, c: AxialCoord): Point {
  const x = layout.size * (1.5 * c.q)
  const y = layout.size * (Math.sqrt(3) * (c.r + c.q / 2))
  return { x: x + layout.origin.x, y: y + layout.origin.y }
}

/** ヘックスの 6 頂点(flat-top: 角度 0,60,...,300 度)。 */
export function hexCorners(layout: HexLayout, c: AxialCoord): readonly Point[] {
  const center = hexToPixel(layout, c)
  const corners: Point[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    corners.push({
      x: center.x + layout.size * Math.cos(angle),
      y: center.y + layout.size * Math.sin(angle),
    })
  }
  return corners
}

/** polygon の points 属性文字列。 */
export function cornersToPoints(corners: readonly Point[]): string {
  return corners.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

/** 座標群を含む SVG viewBox(余白 pad 付き)を計算する。 */
export function computeViewBox(
  layout: HexLayout,
  coords: readonly AxialCoord[],
  pad: number,
): string {
  if (coords.length === 0) return '0 0 100 100'
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const c of coords) {
    for (const p of hexCorners(layout, c)) {
      minX = Math.min(minX, p.x)
      minY = Math.min(minY, p.y)
      maxX = Math.max(maxX, p.x)
      maxY = Math.max(maxY, p.y)
    }
  }
  const w = maxX - minX + 2 * pad
  const h = maxY - minY + 2 * pad
  return `${minX - pad} ${minY - pad} ${w} ${h}`
}
