import { distance, type Vec } from '../geometry/vec'
import { isInsideBoard } from './board'
import { bandForLevel, levelForDistance, type BandId } from './bands'
import { hasLineOfSight, isPointInAnyWall, type Course } from './course'

export type ClickResult =
  | { kind: 'hit' }
  | { kind: 'band'; level: number; band: BandId }
  | { kind: 'grey' }
  | { kind: 'invalid'; reason: 'outside' | 'wall' }

/**
 * What happens when the player clicks at `point`. Pure function of the course,
 * so it can later run on the server without changes (DESIGN.md §7.3).
 */
export function resolveClick(course: Course, point: Vec): ClickResult {
  if (!isInsideBoard(point)) return { kind: 'invalid', reason: 'outside' }
  if (isPointInAnyWall(point, course.walls)) return { kind: 'invalid', reason: 'wall' }

  const { center, radius } = course.target
  const d = distance(point, center)
  if (d <= radius) return { kind: 'hit' }

  if (!hasLineOfSight(point, center, course.walls)) return { kind: 'grey' }
  const level = levelForDistance(d)
  return { kind: 'band', level, band: bandForLevel(level) }
}
