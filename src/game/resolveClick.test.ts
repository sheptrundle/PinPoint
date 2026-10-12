import { describe, expect, it } from 'vitest'
import type { Course } from './course'
import { resolveClick } from './resolveClick'

// Target at (800, 500); a wall at x = 500 hides it from most of the left side.
const course: Course = {
  walls: [{ a: { x: 500, y: 300 }, b: { x: 500, y: 700 }, thickness: 20 }],
  target: { center: { x: 800, y: 500 }, radius: 40 },
}

describe('resolveClick', () => {
  it('rejects clicks outside the board', () => {
    expect(resolveClick(course, { x: -1, y: 500 })).toEqual({ kind: 'invalid', reason: 'outside' })
    expect(resolveClick(course, { x: 500, y: 1001 })).toEqual({ kind: 'invalid', reason: 'outside' })
    expect(resolveClick(course, { x: 1801, y: 500 })).toEqual({ kind: 'invalid', reason: 'outside' })
  })

  it('rejects clicks inside a wall', () => {
    expect(resolveClick(course, { x: 505, y: 500 })).toEqual({ kind: 'invalid', reason: 'wall' })
  })

  it('reports a hit inside the target, including its edge', () => {
    expect(resolveClick(course, { x: 810, y: 490 })).toEqual({ kind: 'hit' })
    expect(resolveClick(course, { x: 840, y: 500 })).toEqual({ kind: 'hit' })
  })

  it('reports a band when the target is visible', () => {
    // Distance 50 → level 1 (green); distance 250 → level 3 (yellow-green).
    expect(resolveClick(course, { x: 850, y: 500 })).toEqual({ kind: 'band', level: 1, band: 1 })
    expect(resolveClick(course, { x: 800, y: 750 })).toEqual({ kind: 'band', level: 3, band: 2 })
    // Distance ≈ 985 → level 10 (orange).
    expect(resolveClick(course, { x: 1700, y: 900 })).toEqual({ kind: 'band', level: 10, band: 4 })
  })

  it('reports grey when a wall blocks the view', () => {
    expect(resolveClick(course, { x: 100, y: 500 })).toEqual({ kind: 'grey' })
  })

  it('reports a band when the sight line passes beyond the end of a wall', () => {
    // Directly above the wall; the sight line to (800, 500) clears the wall's top cap.
    // Distance is exactly 500, which falls on the level 5/6 boundary, so it gets level 5.
    expect(resolveClick(course, { x: 500, y: 100 })).toEqual({ kind: 'band', level: 5, band: 3 })
  })
})
