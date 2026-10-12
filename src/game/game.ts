import type { Vec } from '../geometry/vec'
import type { Course } from './course'
import { resolveClick, type ClickResult } from './resolveClick'

/** A click that counted toward the score (invalid clicks are never recorded). */
export interface CountedClick {
  point: Vec
  result: Exclude<ClickResult, { kind: 'invalid' }>
}

export interface GameState {
  status: 'playing' | 'won'
  clicks: CountedClick[]
}

export const newGame = (): GameState => ({ status: 'playing', clicks: [] })

/**
 * Applies a click. Returns the new state and the click's result,
 * or a null result if the game is already over.
 */
export function playClick(
  state: GameState,
  course: Course,
  point: Vec,
): { state: GameState; result: ClickResult | null } {
  if (state.status === 'won') return { state, result: null }

  const result = resolveClick(course, point)
  if (result.kind === 'invalid') return { state, result }

  return {
    state: {
      status: result.kind === 'hit' ? 'won' : 'playing',
      clicks: [...state.clicks, { point, result }],
    },
    result,
  }
}

/** Score = number of counted clicks, including the winning one. */
export const score = (state: GameState): number => state.clicks.length
