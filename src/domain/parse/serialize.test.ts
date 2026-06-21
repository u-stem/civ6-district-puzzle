import { describe, expect, it } from 'vitest'
import { axialKey, makeAxial } from '../coords/axial'
import { isRiverAdjacent, tileAt, withRiverEdge, withTile } from '../model/map'
import { computeAllBonuses } from '../rules/adjacency'
import { RF_RULESET } from '../rules/adjacencyRules'
import { makeBlankMap } from './makeMap'
import { makeTile } from './makeTile'
import { deserializeMap, serializeMap } from './serialize'

const center = makeAxial(0, 0)

describe('serialize / deserialize の往復', () => {
  it('タイル・川・都心が保持される', () => {
    const a = makeAxial(1, 0)
    let map = makeBlankMap(center, 2)
    map = withTile(
      map,
      makeTile({
        coord: a,
        terrain: 'plains',
        feature: 'woods',
        improvement: 'mine',
        resource: { name: 'iron', resourceClass: 'strategic' },
        district: 'campus',
      }),
    )
    map = withRiverEdge(map, a, makeAxial(1, -1), true)

    const restored = deserializeMap(serializeMap(map))

    expect(restored.tiles.size).toBe(map.tiles.size)
    expect(axialKey(restored.cityCenter)).toBe(axialKey(map.cityCenter))
    const t = tileAt(restored, a)
    expect(t?.terrain).toBe('plains')
    expect(t?.feature).toBe('woods')
    expect(t?.improvement).toBe('mine')
    expect(t?.resource?.resourceClass).toBe('strategic')
    expect(t?.district).toBe('campus')
    expect(isRiverAdjacent(restored, a)).toBe(true)
  })

  it('往復後も隣接ボーナスが一致する', () => {
    const a = makeAxial(2, 0)
    let map = makeBlankMap(center, 3)
    map = withTile(map, makeTile({ coord: a, terrain: 'grassland', district: 'campus' }))
    map = withTile(map, makeTile({ coord: makeAxial(3, 0), terrain: 'mountain' }))

    const before = computeAllBonuses(map, RF_RULESET).get(axialKey(a))
    const after = computeAllBonuses(deserializeMap(serializeMap(map)), RF_RULESET).get(axialKey(a))
    expect(after).toEqual(before)
  })

  it('不正な地形値は安全に無視される', () => {
    const map = makeBlankMap(center, 1)
    const data = serializeMap(map)
    const broken = {
      ...data,
      tiles: [
        ...data.tiles,
        {
          q: 9,
          r: 9,
          terrain: 'lava',
          feature: null,
          improvement: null,
          resource: null,
          hasWorldWonder: false,
          district: null,
        },
      ],
    }
    const restored = deserializeMap(broken)
    // lava タイルは取り込まれない(元の 7 タイルのまま)
    expect(restored.tiles.size).toBe(map.tiles.size)
  })
})
