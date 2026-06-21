/// <reference lib="webworker" />

import { deserializeMap } from '@/domain/parse/serialize'
import { RF_RULESET } from '@/domain/rules/adjacencyRules'
import { solve } from '@/domain/solver/solver'
import type { SolveInput } from '@/domain/solver/types'
import { isSolveRequest, type SolveResponse } from './solverMessages'

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  const data = event.data
  if (!isSolveRequest(data)) return

  // 構造化複製で branded 型が落ちるため、境界で plain → HexMap に再パースする。
  // ルールは現状 R&F 固定(将来ルールセット切替時はリクエストへ含める)。
  const input: SolveInput = {
    map: deserializeMap(data.map),
    districts: data.districts,
    rules: RF_RULESET,
    weights: data.weights,
  }
  const result = solve(input, data.mode)

  const response: SolveResponse = {
    id: data.id,
    placements: result.placements.map((p) => ({
      district: p.district,
      q: p.coord.q,
      r: p.coord.r,
    })),
    score: result.score,
    nodesExplored: result.nodesExplored,
  }
  self.postMessage(response)
})
