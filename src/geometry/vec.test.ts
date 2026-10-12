import { describe, expect, it } from 'vitest'
import { distance } from './vec'

describe('distance', () => {
  it('is zero for the same point', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
  })

  it('computes straight-line distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 300, y: 400 })).toBe(500)
  })

  it('is symmetric', () => {
    const a = { x: 12, y: 870 }
    const b = { x: 640, y: 33 }
    expect(distance(a, b)).toBe(distance(b, a))
  })
})
