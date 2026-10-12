/** Distance bands, closest first (DESIGN.md §3.1). Starting values; tune via playtesting. */
export const BANDS = [
  { id: 1, name: 'Hot', maxDistance: 60 },
  { id: 2, name: 'Warm', maxDistance: 150 },
  { id: 3, name: 'Mild', maxDistance: 300 },
  { id: 4, name: 'Cool', maxDistance: 500 },
  { id: 5, name: 'Cold', maxDistance: Infinity },
] as const

export type BandId = (typeof BANDS)[number]['id']

/** The band for a distance from the target center. Boundaries go to the closer band. */
export function bandForDistance(distance: number): BandId {
  // The last band has maxDistance Infinity, so find() always succeeds.
  return BANDS.find((band) => distance <= band.maxDistance)!.id
}
