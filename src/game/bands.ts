/**
 * Distance feedback (DESIGN.md §3.1). A visible click reports a distance *level*
 * from 1 (closest) to MAX_LEVEL (farthest); each level is LEVEL_WIDTH board units wide.
 * Levels are grouped into color *bands* of uneven size: narrow near the target,
 * and everything past level 10 is red. Tune via playtesting.
 */
export const LEVEL_WIDTH = 100
export const MAX_LEVEL = 20

/** Color bands, closest first. Each covers levels up to and including maxLevel. */
export const BANDS = [
  { id: 1, name: 'Hot', maxLevel: 2 },
  { id: 2, name: 'Warm', maxLevel: 4 },
  { id: 3, name: 'Mild', maxLevel: 7 },
  { id: 4, name: 'Cool', maxLevel: 10 },
  { id: 5, name: 'Cold', maxLevel: MAX_LEVEL },
] as const

export type BandId = (typeof BANDS)[number]['id']

/**
 * The level for a distance from the target center. Boundaries go to the closer
 * level, and anything beyond the last boundary is MAX_LEVEL.
 */
export function levelForDistance(distance: number): number {
  return Math.min(MAX_LEVEL, Math.max(1, Math.ceil(distance / LEVEL_WIDTH)))
}

export function bandForLevel(level: number): BandId {
  // The last band ends at MAX_LEVEL, so find() always succeeds for valid levels.
  return BANDS.find((band) => level <= band.maxLevel)!.id
}
