import { describe, expect, it } from 'vitest'
import { isInsideBoard } from './board'

describe('isInsideBoard', () => {
  it('includes the full wide board, edges included', () => {
    expect(isInsideBoard({ x: 0, y: 0 })).toBe(true)
    expect(isInsideBoard({ x: 1800, y: 1000 })).toBe(true)
    expect(isInsideBoard({ x: 1500, y: 500 })).toBe(true)
  })

  it('excludes points past any edge', () => {
    expect(isInsideBoard({ x: -1, y: 500 })).toBe(false)
    expect(isInsideBoard({ x: 1801, y: 500 })).toBe(false)
    expect(isInsideBoard({ x: 900, y: -1 })).toBe(false)
    expect(isInsideBoard({ x: 900, y: 1001 })).toBe(false)
  })
})
