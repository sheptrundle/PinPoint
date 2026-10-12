/**
 * Distance feedback (DESIGN.md §3.1). A visible click reports a distance *level*
 * from 1 (closest) to MAX_LEVEL (farthest); each level is LEVEL_WIDTH board units wide.
 * Levels are grouped into color *bands* of LEVELS_PER_BAND. Tune via playtesting.
 */
export const LEVEL_WIDTH = 100
export const MAX_LEVEL = 20
export const LEVELS_PER_BAND = 4

/** Color bands, closest first: levels 1–4 are band 1, 5–8 band 2, and so on. */
export const BANDS = [
  { id: 1, name: 'Hot' },
  { id: 2, name: 'Warm' },
  { id: 3, name: 'Mild' },
  { id: 4, name: 'Cool' },
  { id: 5, name: 'Cold' },
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
  return Math.ceil(level / LEVELS_PER_BAND) as BandId
}
