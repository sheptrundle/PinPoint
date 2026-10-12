import { describe, expect, it } from 'vitest'
import { pointToSegmentDistance, segmentsIntersect, segmentToSegmentDistance } from './segment'

const seg = (ax: number, ay: number, bx: number, by: number) => ({
  a: { x: ax, y: ay },
  b: { x: bx, y: by },
})

describe('pointToSegmentDistance', () => {
  const s = seg(0, 0, 100, 0)

  it('measures perpendicular distance to the middle of the segment', () => {
    expect(pointToSegmentDistance({ x: 50, y: 30 }, s)).toBe(30)
  })

  it('measures to the nearest endpoint when past the end', () => {
    expect(pointToSegmentDistance({ x: 130, y: 40 }, s)).toBe(50)
    expect(pointToSegmentDistance({ x: -30, y: -40 }, s)).toBe(50)
  })

  it('is zero for a point on the segment', () => {
    expect(pointToSegmentDistance({ x: 70, y: 0 }, s)).toBe(0)
  })

  it('handles zero-length segments', () => {
    expect(pointToSegmentDistance({ x: 3, y: 4 }, seg(0, 0, 0, 0))).toBe(5)
  })
})

describe('segmentsIntersect', () => {
  it('detects a proper crossing', () => {
    expect(segmentsIntersect(seg(0, 0, 10, 10), seg(0, 10, 10, 0))).toBe(true)
  })

  it('rejects parallel segments', () => {
    expect(segmentsIntersect(seg(0, 0, 10, 0), seg(0, 5, 10, 5))).toBe(false)
  })

  it('rejects segments whose lines cross outside the segments', () => {
    expect(segmentsIntersect(seg(0, 0, 10, 0), seg(20, -5, 20, 5))).toBe(false)
  })

  it('counts touching at an endpoint', () => {
    expect(segmentsIntersect(seg(0, 0, 10, 0), seg(10, 0, 10, 10))).toBe(true)
    expect(segmentsIntersect(seg(0, 0, 10, 0), seg(5, 0, 5, 10))).toBe(true)
  })

  it('handles collinear segments', () => {
    expect(segmentsIntersect(seg(0, 0, 10, 0), seg(5, 0, 15, 0))).toBe(true)
    expect(segmentsIntersect(seg(0, 0, 10, 0), seg(11, 0, 20, 0))).toBe(false)
  })
})

describe('segmentToSegmentDistance', () => {
  it('is zero when segments cross', () => {
    expect(segmentToSegmentDistance(seg(0, 0, 10, 10), seg(0, 10, 10, 0))).toBe(0)
  })

  it('measures the gap between parallel segments', () => {
    expect(segmentToSegmentDistance(seg(0, 0, 10, 0), seg(0, 5, 10, 5))).toBe(5)
  })

  it('measures from an endpoint to the other segment', () => {
    // T-shape with a gap: the vertical segment stops 7 short of the horizontal one.
    expect(segmentToSegmentDistance(seg(0, 0, 100, 0), seg(50, 7, 50, 40))).toBe(7)
  })

  it('measures endpoint to endpoint', () => {
    expect(segmentToSegmentDistance(seg(0, 0, 10, 0), seg(13, 4, 20, 10))).toBe(5)
  })
})
