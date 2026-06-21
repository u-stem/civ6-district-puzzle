'use client'

import { DISTRICT_LABELS, FEATURE_LABELS, IMPROVEMENT_LABELS, TERRAIN_LABELS } from '@/lib/display'
import type { Brush } from '@/state/brush'
import { usePuzzleStore } from '@/state/store'

/** 現在のブラシに応じた操作ヒントを返す。 */
function hintFor(brush: Brush, riverPending: boolean): string {
  switch (brush.kind) {
    case 'inspect':
      return 'タイルをクリックすると右の詳細に隣接ボーナスの内訳が表示されます。'
    case 'erase':
      return 'クリックしたタイルを地形のみ(区域・改善なし)に戻します。'
    case 'river':
      return riverPending
        ? '隣接するもう 1 つのタイルをクリックすると、その辺の川をトグルします(同じ辺をもう一度で消去)。'
        : '川を引く 2 つの隣接タイルを順にクリックします(既にある辺なら消去)。'
    case 'worldWonder':
      return 'クリックしたタイルを世界遺産にします(劇場広場の隣接源)。'
    case 'district':
      return `緑枠のタイルに「${DISTRICT_LABELS[brush.district]}」を配置します(ドラッグで連続配置)。`
    case 'terrain':
      return `クリック/ドラッグで地形を「${TERRAIN_LABELS[brush.terrain]}」に塗ります。`
    case 'feature':
      return `クリック/ドラッグで「${FEATURE_LABELS[brush.feature]}」を塗ります。`
    case 'improvement':
      return `クリック/ドラッグで地形改善「${IMPROVEMENT_LABELS[brush.improvement]}」を塗ります。`
  }
}

export function HintBar() {
  const brush = usePuzzleStore((s) => s.brush)
  const riverPending = usePuzzleStore((s) => s.pendingRiverFrom !== null)

  return <span style={{ fontSize: '0.8rem', color: '#555' }}>{hintFor(brush, riverPending)}</span>
}
