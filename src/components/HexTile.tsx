'use client'

import type { Tile } from '@/domain/model/tile'
import type { YieldBonus } from '@/domain/model/yield'
import { YIELD_TYPES } from '@/domain/model/yield'
import {
  DISTRICT_COLORS,
  DISTRICT_LABELS,
  FEATURE_LABELS,
  TERRAIN_COLORS,
  textColorFor,
} from '@/lib/display'
import { cornersToPoints, type HexLayout, hexCorners, hexToPixel } from '@/lib/hexGeometry'

type Props = {
  readonly layout: HexLayout
  readonly tile: Tile
  readonly bonus: YieldBonus | undefined
  readonly selected: boolean
  readonly validPlacement: boolean
  readonly onPaint: (tile: Tile) => void
  readonly onHoverPaint: (tile: Tile) => void
}

function bonusLabel(bonus: YieldBonus): string {
  const parts: string[] = []
  for (const y of YIELD_TYPES) {
    const v = bonus[y]
    if (v !== undefined && v !== 0) parts.push(`+${v}`)
  }
  return parts.join(' ')
}

export function HexTile({
  layout,
  tile,
  bonus,
  selected,
  validPlacement,
  onPaint,
  onHoverPaint,
}: Props) {
  const points = cornersToPoints(hexCorners(layout, tile.coord))
  const center = hexToPixel(layout, tile.coord)
  const fill =
    tile.district !== null ? DISTRICT_COLORS[tile.district] : TERRAIN_COLORS[tile.terrain]
  const districtLabel = tile.district !== null ? DISTRICT_LABELS[tile.district] : null
  const labelColor = textColorFor(fill)
  const total = bonus !== undefined ? bonusLabel(bonus) : ''

  return (
    <g
      onPointerDown={(e) => {
        e.preventDefault()
        // タッチ/ペンの暗黙ポインタキャプチャを解除し、ドラッグペイントを有効化する。
        e.currentTarget.releasePointerCapture(e.pointerId)
        onPaint(tile)
      }}
      onPointerEnter={(e) => {
        if (e.buttons === 1) onHoverPaint(tile)
      }}
      style={{ cursor: 'pointer' }}
    >
      <polygon
        points={points}
        fill={fill}
        stroke={selected ? '#111' : validPlacement ? '#1faa55' : '#33333355'}
        strokeWidth={
          selected ? layout.size * 0.12 : validPlacement ? layout.size * 0.1 : layout.size * 0.04
        }
      />
      {tile.feature !== null && (
        <text
          x={center.x}
          y={center.y - layout.size * 0.35}
          textAnchor="middle"
          fontSize={layout.size * 0.26}
          fill={labelColor}
        >
          {FEATURE_LABELS[tile.feature]}
        </text>
      )}
      {tile.hasWorldWonder && (
        <text
          x={center.x}
          y={center.y - layout.size * 0.35}
          textAnchor="middle"
          fontSize={layout.size * 0.3}
        >
          ⭐
        </text>
      )}
      {districtLabel !== null && (
        <text
          x={center.x}
          y={center.y + layout.size * 0.05}
          textAnchor="middle"
          fontSize={layout.size * 0.24}
          fill={labelColor}
          fontWeight="bold"
        >
          {districtLabel}
        </text>
      )}
      {total !== '' && (
        <text
          x={center.x}
          y={center.y + layout.size * 0.5}
          textAnchor="middle"
          fontSize={layout.size * 0.3}
          fill="#fff"
          fontWeight="bold"
          stroke="#000"
          strokeWidth={layout.size * 0.02}
          paintOrder="stroke"
        >
          {total}
        </text>
      )}
    </g>
  )
}
