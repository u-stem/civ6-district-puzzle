'use client'

import { DISTRICT_TYPES } from '@/domain/model/district'
import { IMPROVEMENTS, TERRAIN_FEATURES, TERRAINS } from '@/domain/model/terrain'
import {
  DISTRICT_COLORS,
  DISTRICT_LABELS,
  FEATURE_LABELS,
  IMPROVEMENT_LABELS,
  TERRAIN_COLORS,
  TERRAIN_LABELS,
  textColorFor,
} from '@/lib/display'
import type { Brush } from '@/state/brush'
import { usePuzzleStore } from '@/state/store'

/** ブラシが現在選択中かを判定する。 */
function isActive(current: Brush, candidate: Brush): boolean {
  return JSON.stringify(current) === JSON.stringify(candidate)
}

function Group({
  title,
  children,
}: {
  readonly title: string
  readonly children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>{children}</div>
    </div>
  )
}

export function Palette() {
  const brush = usePuzzleStore((s) => s.brush)
  const setBrush = usePuzzleStore((s) => s.setBrush)

  const chip = (candidate: Brush, label: string, color?: string) => (
    <button
      key={label}
      type="button"
      onClick={() => setBrush(candidate)}
      style={{
        padding: '0.2rem 0.5rem',
        fontSize: '0.8rem',
        border: isActive(brush, candidate) ? '2px solid #111' : '1px solid #ccc',
        borderRadius: 4,
        background: color ?? '#fff',
        color: color !== undefined ? textColorFor(color) : '#111',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div>
      <Group title="ツール">
        {chip({ kind: 'inspect' }, '調査')}
        {chip({ kind: 'erase' }, '消去')}
        {chip({ kind: 'river' }, '川(2点)')}
        {chip({ kind: 'worldWonder' }, '世界遺産')}
      </Group>

      <Group title="区域">
        {DISTRICT_TYPES.filter((d) => d !== 'cityCenter').map((d) =>
          chip({ kind: 'district', district: d }, DISTRICT_LABELS[d], DISTRICT_COLORS[d]),
        )}
      </Group>

      <Group title="地形">
        {TERRAINS.map((t) =>
          chip({ kind: 'terrain', terrain: t }, TERRAIN_LABELS[t], TERRAIN_COLORS[t]),
        )}
      </Group>

      <Group title="地形フィーチャー">
        {TERRAIN_FEATURES.map((f) => chip({ kind: 'feature', feature: f }, FEATURE_LABELS[f]))}
      </Group>

      <Group title="地形改善">
        {IMPROVEMENTS.map((im) =>
          chip({ kind: 'improvement', improvement: im }, IMPROVEMENT_LABELS[im]),
        )}
      </Group>
    </div>
  )
}
