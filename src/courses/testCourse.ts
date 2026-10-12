import { TARGET_RADIUS, WALL_THICKNESS, type Course } from '../game/course'

const T = WALL_THICKNESS

/**
 * Hard-coded course for development and playtesting until the editor exists.
 * The target sits in a pocket on the upper right, hidden from most of the board.
 */
export const testCourse: Course = {
  walls: [
    // L-shaped wall on the left
    { a: { x: 450, y: 150 }, b: { x: 450, y: 550 }, thickness: T },
    { a: { x: 450, y: 550 }, b: { x: 900, y: 550 }, thickness: T },
    // Corner pocket on the upper right
    { a: { x: 1170, y: 100 }, b: { x: 1170, y: 400 }, thickness: T },
    { a: { x: 1170, y: 400 }, b: { x: 1530, y: 400 }, thickness: T },
    // Low wall with a short return along the bottom
    { a: { x: 810, y: 750 }, b: { x: 1440, y: 750 }, thickness: T },
    { a: { x: 1440, y: 750 }, b: { x: 1440, y: 900 }, thickness: T },
    // Pillars
    { a: { x: 220, y: 800 }, b: { x: 360, y: 800 }, thickness: 16 },
    { a: { x: 900, y: 290 }, b: { x: 900, y: 330 }, thickness: 16 },
  ],
  target: { center: { x: 1370, y: 250 }, radius: TARGET_RADIUS },
}
