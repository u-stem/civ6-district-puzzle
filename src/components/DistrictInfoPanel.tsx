'use client'

import { makeAxial } from '@/domain/coords/axial'
import { tileAt } from '@/domain/model/map'
import { YIELD_TYPES } from '@/domain/model/yield'
import { explainDistrictBonus } from '@/domain/rules/adjacency'
import { RF_RULESET } from '@/domain/rules/adjacencyRules'
import {
  DISTRICT_LABELS,
  describeSource,
  FEATURE_LABELS,
  TERRAIN_LABELS,
  YIELD_ICONS,
  YIELD_LABELS,
} from '@/lib/display'
import { usePuzzleStore } from '@/state/store'

/** "q,r" を座標へ戻す。 */
function parseKey(key: string): ReturnType<typeof makeAxial> | null {
  const [q, r] = key.split(',').map(Number)
  if (q === undefined || r === undefined || Number.isNaN(q) || Number.isNaN(r)) return null
  return makeAxial(q, r)
}

export function DistrictInfoPanel() {
  const map = usePuzzleStore((s) => s.map)
  const selectedKey = usePuzzleStore((s) => s.selectedKey)

  if (selectedKey === null) {
    return <p style={{ color: '#666' }}>タイルをクリックすると詳細が表示されます。</p>
  }
  const coord = parseKey(selectedKey)
  const tile = coord !== null ? tileAt(map, coord) : undefined
  if (tile === undefined || coord === null) {
    return <p style={{ color: '#666' }}>タイルが見つかりません。</p>
  }

  const { lines, total } = explainDistrictBonus(map, coord, RF_RULESET)

  return (
    <div>
      <h3 style={{ margin: '0 0 0.5rem' }}>
        {tile.district !== null ? DISTRICT_LABELS[tile.district] : '区域なし'}
      </h3>
      <dl style={{ margin: 0, fontSize: '0.9rem' }}>
        <Row label="地形" value={TERRAIN_LABELS[tile.terrain]} />
        {tile.feature !== null && <Row label="地形" value={FEATURE_LABELS[tile.feature]} />}
        {tile.hasWorldWonder && <Row label="世界遺産" value="あり" />}
      </dl>

      {tile.district !== null && tile.district !== 'cityCenter' && (
        <div style={{ marginTop: '0.75rem' }}>
          <strong>隣接ボーナス内訳</strong>
          {lines.length === 0 ? (
            <p style={{ color: '#666', margin: '0.25rem 0' }}>隣接ボーナスなし</p>
          ) : (
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.1rem' }}>
              {lines.map((line) => (
                <li key={`${describeSource(line.rule.source)}-${line.rule.yieldType}`}>
                  {describeSource(line.rule.source)}: {YIELD_ICONS[line.rule.yieldType]}
                  {line.contribution > 0 ? `+${line.contribution}` : line.contribution}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: '0.5rem' }}>
            <strong>合計(切り捨て後): </strong>
            {YIELD_TYPES.filter((y) => (total[y] ?? 0) !== 0).map((y) => (
              <span key={y} style={{ marginRight: '0.5rem' }}>
                {YIELD_ICONS[y]} {YIELD_LABELS[y]} +{total[y]}
              </span>
            ))}
            {YIELD_TYPES.every((y) => (total[y] ?? 0) === 0) && <span>なし</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <dt style={{ color: '#666', minWidth: '4rem' }}>{label}</dt>
      <dd style={{ margin: 0 }}>{value}</dd>
    </div>
  )
}
