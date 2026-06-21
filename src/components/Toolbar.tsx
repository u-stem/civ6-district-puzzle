'use client'

import { useStore } from 'zustand'

import { usePuzzleStore } from '@/state/store'

export function Toolbar() {
  const resetMap = usePuzzleStore((s) => s.resetMap)
  const { undo, redo, clear } = usePuzzleStore.temporal.getState()
  const pastCount = useStore(usePuzzleStore.temporal, (s) => s.pastStates.length)
  const futureCount = useStore(usePuzzleStore.temporal, (s) => s.futureStates.length)

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button type="button" onClick={() => undo()} disabled={pastCount === 0}>
        元に戻す
      </button>
      <button type="button" onClick={() => redo()} disabled={futureCount === 0}>
        やり直す
      </button>
      <button
        type="button"
        onClick={() => {
          resetMap()
          clear()
        }}
      >
        リセット
      </button>
    </div>
  )
}
