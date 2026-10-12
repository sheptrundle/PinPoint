import type { Vec } from '../geometry/vec'

/**
 * Logical board size. Everything in game logic uses these units, never screen pixels.
 * The board is wide (1.8 : 1) to suit desktop monitors and browser windows.
 */
export const BOARD_WIDTH = 1800
export const BOARD_HEIGHT = 1000

/**
 * The board is scaled to cover the whole window without stretching, so on screens
 * that aren't exactly 1.8 : 1 a little of the edge is cropped off. Everything inside
 * this safe area stays visible for window shapes from about 1.6 : 1 to 2.1 : 1.
 * The target must lie inside it; walls may extend past it.
 */
export const SAFE_AREA = { minX: 100, maxX: 1700, minY: 75, maxY: 925 }

export function isInsideBoard(p: Vec): boolean {
  return p.x >= 0 && p.x <= BOARD_WIDTH && p.y >= 0 && p.y <= BOARD_HEIGHT
}
