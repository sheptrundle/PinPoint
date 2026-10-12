import { describe, expect, it } from 'vitest'
import { hasLineOfSight, isPointInWall, validateCourse, type Course, type Wall } from './course'

// Vertical wall at x = 500 from y = 400 to y = 600, 20 thick:
// occupies x 490–510, and its round caps reach y 390 and 610.
const wall: Wall = { a: { x: 500, y: 400 }, b: { x: 500, y: 600 }, thickness: 20 }

describe('isPointInWall', () => {
  it('includes points on the center line and within half the thickness', () => {
    expect(isPointInWall({ x: 500, y: 500 }, wall)).toBe(true)
    expect(isPointInWall({ x: 509, y: 500 }, wall)).toBe(true)
  })

  it('includes the edge itself', () => {
    expect(isPointInWall({ x: 510, y: 500 }, wall)).toBe(true)
  })

  it('includes the round end caps', () => {
    expect(isPointInWall({ x: 500, y: 391 }, wall)).toBe(true)
  })

  it('excludes points outside', () => {
    expect(isPointInWall({ x: 511, y: 500 }, wall)).toBe(false)
    expect(isPointInWall({ x: 500, y: 389 }, wall)).toBe(false)
    // Diagonally past the corner: a square end would contain this, a round cap doesn't.
    expect(isPointInWall({ x: 508, y: 392 }, wall)).toBe(false)
  })
})

describe('hasLineOfSight', () => {
  it('is blocked by a wall in between', () => {
    expect(hasLineOfSight({ x: 100, y: 500 }, { x: 900, y: 500 }, [wall])).toBe(false)
  })

  it('is clear when the line passes beyond the wall', () => {
    expect(hasLineOfSight({ x: 100, y: 300 }, { x: 900, y: 300 }, [wall])).toBe(true)
  })

  it('is clear when both points are on the same side', () => {
    expect(hasLineOfSight({ x: 100, y: 500 }, { x: 400, y: 450 }, [wall])).toBe(true)
  })

  it('treats grazing the round cap as blocked', () => {
    expect(hasLineOfSight({ x: 100, y: 390 }, { x: 900, y: 390 }, [wall])).toBe(false)
    expect(hasLineOfSight({ x: 100, y: 389 }, { x: 900, y: 389 }, [wall])).toBe(true)
  })

  it('is clear with no walls', () => {
    expect(hasLineOfSight({ x: 0, y: 0 }, { x: 1000, y: 1000 }, [])).toBe(true)
  })
})

describe('validateCourse', () => {
  const valid: Course = { walls: [wall], target: { center: { x: 800, y: 500 }, radius: 40 } }

  it('accepts a valid course', () => {
    expect(validateCourse(valid)).toEqual([])
  })

  it('rejects a target overlapping a wall', () => {
    const course = { ...valid, target: { center: { x: 540, y: 500 }, radius: 40 } }
    expect(validateCourse(course)).toContain('Wall 0 overlaps the target.')
  })

  it('rejects a target outside the safe area', () => {
    const offEdge = { ...valid, target: { center: { x: 1780, y: 500 }, radius: 40 } }
    expect(validateCourse(offEdge)).toContain('Target must lie fully inside the safe area.')
    // On the board, but close enough to the top edge that it could be cropped off.
    const nearEdge = { ...valid, target: { center: { x: 800, y: 80 }, radius: 40 } }
    expect(validateCourse(nearEdge)).toContain('Target must lie fully inside the safe area.')
  })

  it('rejects non-positive sizes', () => {
    const course: Course = {
      walls: [{ ...wall, thickness: 0 }],
      target: { center: { x: 800, y: 500 }, radius: 0 },
    }
    expect(validateCourse(course)).toEqual(
      expect.arrayContaining([
        'Target radius must be positive.',
        'Wall 0 must have a positive thickness.',
      ]),
    )
  })
})
