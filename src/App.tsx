import { useState } from 'react'
import { testCourse } from './courses/testCourse'
import { newGame, playClick, score } from './game/game'
import type { Vec } from './geometry/vec'
import { Board } from './render/Board'

type Screen = 'start' | 'playing' | 'won'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [game, setGame] = useState(newGame)
  const [rejected, setRejected] = useState<{ point: Vec; key: number } | null>(null)

  function handleBoardClick(point: Vec) {
    if (screen !== 'playing') return

    const { state, result } = playClick(game, testCourse, point)
    if (result?.kind === 'invalid') {
      // Clicks in the margin are silently ignored; clicks in a wall get a brief "nope".
      if (result.reason === 'wall') setRejected({ point, key: Date.now() })
      return
    }

    setGame(state)
    if (state.status === 'won') setScreen('won')
  }

  function restart() {
    setGame(newGame())
    setRejected(null)
    setScreen('playing')
  }

  return (
    <>
      <Board
        course={testCourse}
        clicks={game.clicks}
        revealTarget={game.status === 'won'}
        rejected={rejected}
        onBoardClick={handleBoardClick}
      />

      {screen === 'playing' && <div className="click-counter">Clicks: {score(game)}</div>}

      {screen === 'start' && (
        <div className="overlay">
          <div className="card">
            <h1>PinPoint</h1>
            <p>
              Find the hidden blue circle in as few clicks as possible. Each click shows how close
              you are (1 = closest, 20 = farthest), or turns grey if a wall blocks its view of the
              circle.
            </p>
            <button onClick={() => setScreen('playing')}>Start</button>
          </div>
        </div>
      )}

      {screen === 'won' && (
        <div className="overlay overlay-won">
          <div className="card">
            <h1>Found it!</h1>
            <p>
              You found the circle in <strong>{score(game)}</strong>{' '}
              {score(game) === 1 ? 'click' : 'clicks'}.
            </p>
            <button onClick={restart}>Play again</button>
          </div>
        </div>
      )}
    </>
  )
}
