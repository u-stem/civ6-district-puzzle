'use client'

import { useMemo } from 'react'
import { axialKey } from '@/domain/coords/axial'
import type { Tile } from '@/domain/model/tile'
import { computeAllBonuses } from '@/domain/rules/adjacency'
import { RF_RULESET } from '@/domain/rules/adjacencyRules'
import { canPlace } from '@/domain/rules/placement'
import { computeViewBox, makeLayout } from '@/lib/hexGeometry'
import { usePuzzleStore } from '@/state/store'
import { HexTile } from './HexTile'
import { RiverLayer } from './RiverLayer'

const HEX_SIZE = 40

export function HexMap() {
  const map = usePuzzleStore((s) => s.map)
  const selectedKey = usePuzzleStore((s) => s.selectedKey)
  const brush = usePuzzleStore((s) => s.brush)
  const paintTile = usePuzzleStore((s) => s.paintTile)

  const layout = useMemo(() => makeLayout(HEX_SIZE), [])
  const tiles = useMemo(() => [...map.tiles.values()], [map])
  const bonuses = useMemo(() => computeAllBonuses(map, RF_RULESET), [map])
  const viewBox = useMemo(
    () =>
      computeViewBox(
        layout,
        tiles.map((t) => t.coord),
        HEX_SIZE * 0.4,
      ),
    [layout, tiles],
  )

  // 区域ブラシ選択中は配置可能なタイルを強調する。
  const validKeys = useMemo(() => {
    if (brush.kind !== 'district') return null
    const keys = new Set<string>()
    for (const tile of map.tiles.values()) {
      if (canPlace(map, tile.coord, brush.district)) keys.add(axialKey(tile.coord))
    }
    return keys
  }, [map, brush])

  const onPaint = (tile: Tile) => paintTile(tile.coord)

  return (
    <svg
      viewBox={viewBox}
      style={{ width: '100%', height: '100%', touchAction: 'none', userSelect: 'none' }}
      role="application"
      aria-label="区域マップ"
    >
      <title>Civ6 区域マップ</title>
      {tiles.map((tile) => (
        <HexTile
          key={axialKey(tile.coord)}
          layout={layout}
          tile={tile}
          bonus={bonuses.get(axialKey(tile.coord))}
          selected={selectedKey === axialKey(tile.coord)}
          validPlacement={validKeys?.has(axialKey(tile.coord)) ?? false}
          onPaint={onPaint}
          onHoverPaint={onPaint}
        />
      ))}
      <RiverLayer layout={layout} map={map} />
    </svg>
  )
}
