import { temporal } from 'zundo'
import { create } from 'zustand'
import type { AxialCoord } from '@/domain/coords/axial'
import { axialKey, makeAxial } from '@/domain/coords/axial'
import { applyTileBrush, type TileBrushOp, toggleRiver } from '@/domain/edit/applyBrush'
import type { DistrictType } from '@/domain/model/district'
import type { HexMap } from '@/domain/model/map'
import { makeBlankMap } from '@/domain/parse/makeMap'
import type { Brush } from './brush'

export const DEFAULT_RADIUS = 3
const DEFAULT_CENTER = makeAxial(0, 0)

export type PuzzleState = {
  readonly map: HexMap
  readonly brush: Brush
  readonly selectedKey: string | null
  /** river ブラシで最初にクリックしたタイル(2 点目で辺を確定)。 */
  readonly pendingRiverFrom: AxialCoord | null

  setBrush: (brush: Brush) => void
  selectTile: (coord: AxialCoord) => void
  paintTile: (coord: AxialCoord) => void
  resetMap: () => void
  /** ソルバーの解(区域配置の集合)を現在のマップに適用する。 */
  applyPlacements: (placements: readonly Placement[]) => void
}

/** ソルバー解の 1 配置(座標 + 区域)。 */
export type Placement = {
  readonly coord: AxialCoord
  readonly district: DistrictType
}

/** Brush をタイル操作 TileBrushOp に変換(inspect/river は null)。 */
function brushToOp(brush: Brush): TileBrushOp | null {
  switch (brush.kind) {
    case 'inspect':
    case 'river':
      return null
    case 'erase':
      return { kind: 'erase' }
    case 'district':
      return { kind: 'district', district: brush.district }
    case 'terrain':
      return { kind: 'terrain', terrain: brush.terrain }
    case 'feature':
      return { kind: 'feature', feature: brush.feature }
    case 'improvement':
      return { kind: 'improvement', improvement: brush.improvement }
    case 'worldWonder':
      return { kind: 'worldWonder' }
  }
}

export const usePuzzleStore = create<PuzzleState>()(
  temporal(
    (set, get) => ({
      map: makeBlankMap(DEFAULT_CENTER, DEFAULT_RADIUS),
      brush: { kind: 'inspect' },
      selectedKey: null,
      pendingRiverFrom: null,

      setBrush: (brush) => set({ brush, pendingRiverFrom: null }),

      selectTile: (coord) => set({ selectedKey: axialKey(coord) }),

      paintTile: (coord) => {
        const { brush, map, pendingRiverFrom } = get()

        if (brush.kind === 'inspect') {
          set({ selectedKey: axialKey(coord) })
          return
        }

        if (brush.kind === 'river') {
          // 1 点目を記録し、2 点目が隣接なら辺をトグル
          if (pendingRiverFrom === null) {
            set({ pendingRiverFrom: coord, selectedKey: axialKey(coord) })
            return
          }
          set({
            map: toggleRiver(map, pendingRiverFrom, coord),
            pendingRiverFrom: null,
          })
          return
        }

        const op = brushToOp(brush)
        if (op === null) return
        set({ map: applyTileBrush(map, coord, op), selectedKey: axialKey(coord) })
      },

      resetMap: () =>
        set({
          map: makeBlankMap(DEFAULT_CENTER, DEFAULT_RADIUS),
          selectedKey: null,
          pendingRiverFrom: null,
        }),

      applyPlacements: (placements) => {
        let next = get().map
        for (const p of placements) {
          next = applyTileBrush(next, p.coord, { kind: 'district', district: p.district })
        }
        set({ map: next })
      },
    }),
    {
      // Undo/Redo の対象は map のみ(選択やブラシは履歴に含めない)。
      partialize: (state) => ({ map: state.map }),
      equality: (a, b) => a.map === b.map,
      // ドラッグペイント中の連続更新を 1 つの履歴へまとめる(末尾デバウンス)。
      handleSet: (handleSet) => debounce(handleSet, 250),
    },
  ),
)

/** 末尾デバウンス。連続呼び出しを最後の 1 回にまとめる。 */
function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/** Undo/Redo を呼ぶための temporal ストアアクセサ。 */
export const useTemporalStore = usePuzzleStore.temporal
