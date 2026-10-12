/** A point or vector in board coordinates (the board is BOARD_SIZE × BOARD_SIZE). */
export interface Vec {
  x: number
  y: number
}

/** Logical board size. Everything in game logic uses these units, never screen pixels. */
export const BOARD_SIZE = 1000

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y
}

/** 2D cross product (z component of a × b). Sign tells which side b is of a. */
export function cross(a: Vec, b: Vec): number {
  return a.x * b.y - a.y * b.x
}

export function distance(a: Vec, b: Vec): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function isInsideBoard(p: Vec): boolean {
  return p.x >= 0 && p.x <= BOARD_SIZE && p.y >= 0 && p.y <= BOARD_SIZE
}
