import { describe, expect, it } from 'vitest'
import { BANDS, bandForLevel, levelForDistance, MAX_LEVEL } from './bands'

describe('levelForDistance', () => {
  it('maps each 100 units of distance to one level', () => {
    expect(levelForDistance(50)).toBe(1)
    expect(levelForDistance(150)).toBe(2)
    expect(levelForDistance(650)).toBe(7)
    expect(levelForDistance(1950)).toBe(20)
  })

  it('gives exact boundaries to the closer level', () => {
    expect(levelForDistance(100)).toBe(1)
    expect(levelForDistance(100.0001)).toBe(2)
    expect(levelForDistance(400)).toBe(4)
    expect(levelForDistance(1900)).toBe(19)
  })

  it('caps far distances at the last level', () => {
    expect(levelForDistance(5000)).toBe(MAX_LEVEL)
  })

  it('never goes below level 1', () => {
    expect(levelForDistance(0)).toBe(1)
  })
})

describe('bandForLevel', () => {
  it('groups levels into uneven colors, with everything past 10 red', () => {
    expect([1, 2].map(bandForLevel)).toEqual([1, 1])
    expect([3, 4].map(bandForLevel)).toEqual([2, 2])
    expect([5, 6, 7].map(bandForLevel)).toEqual([3, 3, 3])
    expect([8, 9, 10].map(bandForLevel)).toEqual([4, 4, 4])
    expect([11, 15, 20].map(bandForLevel)).toEqual([5, 5, 5])
  })

  it('covers every level with a defined band', () => {
    const ids = BANDS.map((b) => b.id as number)
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(ids).toContain(bandForLevel(level))
    }
  })
})
