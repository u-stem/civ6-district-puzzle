'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { DistrictType } from '@/domain/model/district'
import type { HexMap } from '@/domain/model/map'
import type { YieldType } from '@/domain/model/yield'
import { serializeMap } from '@/domain/parse/serialize'
import type { SolverMode } from '@/domain/solver/solver'
import { isSolveResponse, type SolveRequest, type SolveResponse } from '@/workers/solverMessages'

type Weights = Readonly<Partial<Record<YieldType, number>>> | undefined

/**
 * ソルバーを Web Worker で実行するフック。UI スレッドをブロックしない。
 * 各 solve に id を振り、最新リクエストの応答のみを受理する(古い応答は破棄)。
 */
export function useSolver() {
  const workerRef = useRef<Worker | null>(null)
  const pendingId = useRef(0)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SolveResponse | null>(null)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/solver.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker

    const onMessage = (event: MessageEvent<unknown>) => {
      if (!isSolveResponse(event.data)) return
      // 最新リクエストの応答だけを採用する。
      if (event.data.id !== pendingId.current) return
      setResult(event.data)
      setRunning(false)
    }
    worker.addEventListener('message', onMessage)

    return () => {
      worker.removeEventListener('message', onMessage)
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const solve = useCallback(
    (map: HexMap, districts: readonly DistrictType[], mode: SolverMode, weights?: Weights) => {
      const worker = workerRef.current
      if (worker === null || districts.length === 0) return
      pendingId.current += 1
      setRunning(true)
      setResult(null)
      const request: SolveRequest = {
        id: pendingId.current,
        map: serializeMap(map),
        districts,
        mode,
        weights,
      }
      worker.postMessage(request)
    },
    [],
  )

  return { solve, running, result, clearResult: () => setResult(null) }
}
