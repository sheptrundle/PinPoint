/** A point or vector in board coordinates (the board is BOARD_SIZE × BOARD_SIZE). */
export interface Vec {
  x: number
  y: number
}

/** Logical board size. Everything in game logic uses these units, never screen pixels. */
export const BOARD_SIZE = 1000

export function distance(a: Vec, b: Vec): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}
