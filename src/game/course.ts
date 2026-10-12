import { pointToSegmentDistance, segmentToSegmentDistance, type Segment } from '../geometry/segment'
import { BOARD_SIZE, type Vec } from '../geometry/vec'

/**
 * A wall is a straight line with a thickness and round end caps (a "capsule").
 * Anything within thickness / 2 of the segment a–b is inside the wall.
 */
export interface Wall {
  a: Vec
  b: Vec
  thickness: number
}

export interface Target {
  center: Vec
  radius: number
}

export interface Course {
  walls: Wall[]
  target: Target
}

/** Constant target size for every course (DESIGN.md §5.4). Tune via playtesting. */
export const TARGET_RADIUS = 40

/** Tolerance for floating-point comparisons, so exact grazes count as touching. */
const EPSILON = 1e-9

export function isPointInWall(p: Vec, wall: Wall): boolean {
  return pointToSegmentDistance(p, wall) <= wall.thickness / 2 + EPSILON
}

export function isPointInAnyWall(p: Vec, walls: Wall[]): boolean {
  return walls.some((wall) => isPointInWall(p, wall))
}

/** True if the segment touches or passes through the wall (grazing counts as blocked). */
export function segmentHitsWall(s: Segment, wall: Wall): boolean {
  return segmentToSegmentDistance(s, wall) <= wall.thickness / 2 + EPSILON
}

export function hasLineOfSight(from: Vec, to: Vec, walls: Wall[]): boolean {
  const sightLine = { a: from, b: to }
  return !walls.some((wall) => segmentHitsWall(sightLine, wall))
}

/** Returns a list of problems with the course; an empty list means it's valid. */
export function validateCourse(course: Course): string[] {
  const errors: string[] = []
  const { center, radius } = course.target

  if (!(radius > 0)) errors.push('Target radius must be positive.')
  if (
    center.x - radius < 0 ||
    center.x + radius > BOARD_SIZE ||
    center.y - radius < 0 ||
    center.y + radius > BOARD_SIZE
  ) {
    errors.push('Target must lie fully inside the board.')
  }

  course.walls.forEach((wall, i) => {
    if (!(wall.thickness > 0)) errors.push(`Wall ${i} must have a positive thickness.`)
    if (pointToSegmentDistance(center, wall) <= radius + wall.thickness / 2) {
      errors.push(`Wall ${i} overlaps the target.`)
    }
  })

  return errors
}
