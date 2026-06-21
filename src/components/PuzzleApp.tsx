'use client'

import { DistrictInfoPanel } from './DistrictInfoPanel'
import { HexMap } from './HexMap'
import { HintBar } from './HintBar'
import { Palette } from './Palette'
import { SolverPanel } from './SolverPanel'
import { Toolbar } from './Toolbar'

export function PuzzleApp() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 280px',
        height: '100dvh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <aside style={{ padding: '1rem', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>パレット</h2>
        <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.75rem' }}>
          チップの色はマップ上の地形・区域の色に対応します(凡例も兼ねます)。
        </p>
        <Palette />
      </aside>

      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div
          style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Toolbar />
          <HintBar />
        </div>
        <div style={{ flex: 1, minHeight: 0, background: '#f4f6f8' }}>
          <HexMap />
        </div>
      </main>

      <aside
        style={{
          padding: '1rem',
          borderLeft: '1px solid #ddd',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>詳細</h2>
          <DistrictInfoPanel />
        </div>
        <SolverPanel />
      </aside>
    </div>
  )
}
