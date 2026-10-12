import { cross, distance, dot, sub, type Vec } from './vec'

export interface Segment {
  a: Vec
  b: Vec
}

/** Shortest distance from point p to segment s (handles zero-length segments). */
export function pointToSegmentDistance(p: Vec, s: Segment): number {
  const ab = sub(s.b, s.a)
  const lengthSq = dot(ab, ab)
  if (lengthSq === 0) return distance(p, s.a)

  // Project p onto the segment's line, clamped to the segment's ends.
  const t = Math.max(0, Math.min(1, dot(sub(p, s.a), ab) / lengthSq))
  return distance(p, { x: s.a.x + t * ab.x, y: s.a.y + t * ab.y })
}

/** True if p lies within the bounding box of segment s (used for collinear cases). */
function withinBounds(p: Vec, s: Segment): boolean {
  return (
    Math.min(s.a.x, s.b.x) <= p.x &&
    p.x <= Math.max(s.a.x, s.b.x) &&
    Math.min(s.a.y, s.b.y) <= p.y &&
    p.y <= Math.max(s.a.y, s.b.y)
  )
}

/** True if the two segments touch or cross, including at endpoints and when collinear. */
export function segmentsIntersect(s1: Segment, s2: Segment): boolean {
  const d1 = cross(sub(s2.b, s2.a), sub(s1.a, s2.a))
  const d2 = cross(sub(s2.b, s2.a), sub(s1.b, s2.a))
  const d3 = cross(sub(s1.b, s1.a), sub(s2.a, s1.a))
  const d4 = cross(sub(s1.b, s1.a), sub(s2.b, s1.a))

  // Proper crossing: each segment's endpoints are strictly on opposite sides of the other.
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  // Touching / collinear: an endpoint lies on the other segment.
  return (
    (d1 === 0 && withinBounds(s1.a, s2)) ||
    (d2 === 0 && withinBounds(s1.b, s2)) ||
    (d3 === 0 && withinBounds(s2.a, s1)) ||
    (d4 === 0 && withinBounds(s2.b, s1))
  )
}

/** Shortest distance between two segments (0 if they touch or cross). */
export function segmentToSegmentDistance(s1: Segment, s2: Segment): number {
  if (segmentsIntersect(s1, s2)) return 0
  // Non-intersecting segments are closest at one of the four endpoints.
  return Math.min(
    pointToSegmentDistance(s1.a, s2),
    pointToSegmentDistance(s1.b, s2),
    pointToSegmentDistance(s2.a, s1),
    pointToSegmentDistance(s2.b, s1),
  )
}
