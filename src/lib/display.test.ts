import { describe, expect, it } from 'vitest'
import { TERRAIN_COLORS, textColorFor } from './display'

describe('textColorFor', () => {
  it('淡い背景には濃い文字', () => {
    expect(textColorFor('#eef2f5')).toBe('#111') // 雪原
    expect(textColorFor('#f2c94c')).toBe('#111') // 聖地(黄)
    expect(textColorFor('#ffffff')).toBe('#111')
  })

  it('濃い背景には白文字', () => {
    expect(textColorFor('#2f80ed')).toBe('#fff') // キャンパス(青)
    expect(textColorFor('#000000')).toBe('#fff')
  })

  it('全地形色で例外を投げない', () => {
    for (const color of Object.values(TERRAIN_COLORS)) {
      expect(['#111', '#fff']).toContain(textColorFor(color))
    }
  })
})
