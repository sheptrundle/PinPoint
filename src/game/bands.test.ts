import { describe, expect, it } from 'vitest'
import { bandForDistance } from './bands'

describe('bandForDistance', () => {
  it('maps distances to bands, closest first', () => {
    expect(bandForDistance(0)).toBe(1)
    expect(bandForDistance(100)).toBe(2)
    expect(bandForDistance(200)).toBe(3)
    expect(bandForDistance(400)).toBe(4)
    expect(bandForDistance(900)).toBe(5)
  })

  it('gives exact boundaries to the closer band', () => {
    expect(bandForDistance(60)).toBe(1)
    expect(bandForDistance(150)).toBe(2)
    expect(bandForDistance(300)).toBe(3)
    expect(bandForDistance(500)).toBe(4)
    expect(bandForDistance(500.0001)).toBe(5)
  })
})
