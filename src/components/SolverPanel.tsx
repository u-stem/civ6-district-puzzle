'use client'

import { useState } from 'react'

import { makeAxial } from '@/domain/coords/axial'
import { DISTRICT_TYPES, type DistrictType } from '@/domain/model/district'
import type { YieldType } from '@/domain/model/yield'
import type { SolverMode } from '@/domain/solver/solver'
import { DISTRICT_LABELS, YIELD_LABELS } from '@/lib/display'
import { type Placement, usePuzzleStore } from '@/state/store'
import { useSolver } from './useSolver'

// 自前の隣接イールドを受け取る区域(探索対象として主に意味がある)。
const YIELD_DISTRICTS: readonly DistrictType[] = [
  'campus',
  'holySite',
  'theaterSquare',
  'commercialHub',
  'harbor',
  'industrialZone',
]
// イールドは無いが隣接区域へボーナスを与える(補助的に置ける)区域。
const SUPPORT_DISTRICTS: readonly DistrictType[] = ['governmentPlaza', 'encampment']

const SOLVABLE: readonly DistrictType[] = DISTRICT_TYPES.filter(
  (d) => YIELD_DISTRICTS.includes(d) || SUPPORT_DISTRICTS.includes(d),
)

// 重み付けで最適化する対象イールド。
const TARGET_YIELDS: readonly YieldType[] = ['science', 'faith', 'culture', 'gold', 'production']

type Target = 'all' | YieldType

export function SolverPanel() {
  const map = usePuzzleStore((s) => s.map)
  const applyPlacements = usePuzzleStore((s) => s.applyPlacements)
  const { solve, running, result, clearResult } = useSolver()

  const [counts, setCounts] = useState<Readonly<Record<string, number>>>({})
  const [mode, setMode] = useState<SolverMode>('exact')
  const [target, setTarget] = useState<Target>('all')

  const districts: DistrictType[] = []
  for (const d of SOLVABLE) {
    for (let i = 0; i < (counts[d] ?? 0); i++) districts.push(d)
  }

  const setCount = (d: DistrictType, delta: number) =>
    setCounts((c) => ({ ...c, [d]: Math.max(0, (c[d] ?? 0) + delta) }))

  const weights = target === 'all' ? undefined : { [target]: 1 }

  const apply = () => {
    if (result === null) return
    const placements: Placement[] = result.placements.map((p) => ({
      coord: makeAxial(p.q, p.r),
      district: p.district,
    }))
    applyPlacements(placements)
    clearResult()
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>ソルバー</h2>
      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.5rem' }}>
        配置したい区域を選び、地形固定で最適配置を探索します。
      </p>

      <div style={{ marginBottom: '0.5rem' }}>
        {SOLVABLE.map((d) => (
          <div
            key={d}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2px 0' }}
          >
            <button type="button" onClick={() => setCount(d, -1)}>
              −
            </button>
            <span style={{ minWidth: '1.2rem', textAlign: 'center' }}>{counts[d] ?? 0}</span>
            <button type="button" onClick={() => setCount(d, 1)}>
              ＋
            </button>
            <span style={{ fontSize: '0.85rem' }}>{DISTRICT_LABELS[d]}</span>
            {SUPPORT_DISTRICTS.includes(d) && (
              <span style={{ fontSize: '0.7rem', color: '#999' }}>(隣接へ付与)</span>
            )}
          </div>
        ))}
      </div>

      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        最適化対象:{' '}
        <select
          value={target}
          onChange={(e) => {
            const v = e.target.value
            setTarget(v === 'all' ? 'all' : toYield(v))
          }}
        >
          <option value="all">全イールド合計</option>
          {TARGET_YIELDS.map((y) => (
            <option key={y} value={y}>
              {YIELD_LABELS[y]}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem' }}>
          <input
            type="radio"
            name="solver-mode"
            checked={mode === 'exact'}
            onChange={() => setMode('exact')}
          />
          厳密
        </label>
        <label style={{ fontSize: '0.85rem' }}>
          <input
            type="radio"
            name="solver-mode"
            checked={mode === 'fast'}
            onChange={() => setMode('fast')}
          />
          高速
        </label>
      </div>

      <button
        type="button"
        disabled={running || districts.length === 0}
        onClick={() => solve(map, districts, mode, weights)}
        style={{ width: '100%', padding: '0.4rem' }}
      >
        {running ? '探索中…' : `最適配置を探索(${districts.length} 区域)`}
      </button>

      {result !== null && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
          <div>
            スコア: <strong>{result.score}</strong> / 評価数: {result.nodesExplored}
          </div>
          <button type="button" onClick={apply} style={{ marginTop: '0.5rem', width: '100%' }}>
            この配置をマップへ適用
          </button>
        </div>
      )}
    </div>
  )
}

/** select の値(string)を YieldType に絞り込む。未知値は science へフォールバック。 */
function toYield(value: string): YieldType {
  return TARGET_YIELDS.find((y) => y === value) ?? 'science'
}
