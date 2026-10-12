import { describe, expect, it } from 'vitest'
import type { Course } from './course'
import { newGame, playClick, score } from './game'

const course: Course = {
  walls: [{ a: { x: 500, y: 300 }, b: { x: 500, y: 700 }, thickness: 20 }],
  target: { center: { x: 800, y: 500 }, radius: 40 },
}

describe('playClick', () => {
  it('records counted clicks and keeps playing until a hit', () => {
    let { state } = playClick(newGame(), course, { x: 100, y: 500 })
    ;({ state } = playClick(state, course, { x: 800, y: 900 }))
    expect(state.status).toBe('playing')
    expect(score(state)).toBe(2)
    expect(state.clicks.map((c) => c.result.kind)).toEqual(['grey', 'band'])
  })

  it('does not count invalid clicks', () => {
    const start = newGame()
    const { state, result } = playClick(start, course, { x: 500, y: 500 })
    expect(result).toEqual({ kind: 'invalid', reason: 'wall' })
    expect(state).toBe(start)
    expect(score(state)).toBe(0)
  })

  it('wins on a hit, counting the winning click', () => {
    let { state } = playClick(newGame(), course, { x: 100, y: 500 })
    ;({ state } = playClick(state, course, { x: 800, y: 500 }))
    expect(state.status).toBe('won')
    expect(score(state)).toBe(2)
  })

  it('ignores clicks after winning', () => {
    const won = playClick(newGame(), course, { x: 800, y: 500 }).state
    const { state, result } = playClick(won, course, { x: 100, y: 100 })
    expect(result).toBeNull()
    expect(state).toBe(won)
  })

  it('does not mutate the previous state', () => {
    const start = newGame()
    playClick(start, course, { x: 100, y: 500 })
    expect(start.clicks).toEqual([])
  })
})
