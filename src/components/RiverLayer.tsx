'use client'

import { makeAxial } from '@/domain/coords/axial'
import type { HexMap } from '@/domain/model/map'
import { type HexLayout, hexCorners } from '@/lib/hexGeometry'

type Props = {
  readonly layout: HexLayout
  readonly map: HexMap
}

/** edgeKey "q,r|q,r" を 2 座標へ戻す。 */
function parseEdgeKey(
  key: string,
): readonly [ReturnType<typeof makeAxial>, ReturnType<typeof makeAxial>] | null {
  const [ka, kb] = key.split('|')
  if (ka === undefined || kb === undefined) return null
  const a = ka.split(',').map(Number)
  const b = kb.split(',').map(Number)
  const [aq, ar] = a
  const [bq, br] = b
  if (aq === undefined || ar === undefined || bq === undefined || br === undefined) return null
  return [makeAxial(aq, ar), makeAxial(bq, br)]
}

/**
 * 川を「2 タイルが共有する辺」として描く。共有辺は両タイルの頂点集合の
 * 交わり 2 点で表せる。
 */
export function RiverLayer({ layout, map }: Props) {
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (const key of map.rivers) {
    const parsed = parseEdgeKey(key)
    if (parsed === null) continue
    const [a, b] = parsed
    const ca = hexCorners(layout, a)
    const cb = hexCorners(layout, b)
    const shared = ca.filter((p) =>
      cb.some((q) => Math.abs(p.x - q.x) < 0.5 && Math.abs(p.y - q.y) < 0.5),
    )
    const [p0, p1] = shared
    if (p0 === undefined || p1 === undefined) continue
    segments.push({ x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y })
  }

  return (
    <g>
      {segments.map((s, i) => (
        <line
          // biome-ignore lint/suspicious/noArrayIndexKey: 川セグメントは順序固定で再生成される
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="#2b6cb0"
          strokeWidth={layout.size * 0.18}
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}
