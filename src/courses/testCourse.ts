import { TARGET_RADIUS, type Course } from '../game/course'

/**
 * Hard-coded course for development and playtesting until the editor exists.
 * The target sits in a pocket on the upper right, hidden from most of the board.
 */
export const testCourse: Course = {
  walls: [
    // L-shaped wall on the left
    { a: { x: 250, y: 150 }, b: { x: 250, y: 550 }, thickness: 20 },
    { a: { x: 250, y: 550 }, b: { x: 500, y: 550 }, thickness: 20 },
    // Corner pocket on the upper right
    { a: { x: 650, y: 100 }, b: { x: 650, y: 400 }, thickness: 20 },
    { a: { x: 650, y: 400 }, b: { x: 850, y: 400 }, thickness: 20 },
    // Low wall with a short return along the bottom
    { a: { x: 450, y: 750 }, b: { x: 800, y: 750 }, thickness: 20 },
    { a: { x: 800, y: 750 }, b: { x: 800, y: 900 }, thickness: 20 },
    // Pillars
    { a: { x: 120, y: 800 }, b: { x: 200, y: 800 }, thickness: 30 },
    { a: { x: 500, y: 300 }, b: { x: 500, y: 320 }, thickness: 40 },
  ],
  target: { center: { x: 760, y: 250 }, radius: TARGET_RADIUS },
}
