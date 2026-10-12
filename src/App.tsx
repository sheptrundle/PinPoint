import { useState } from 'react'
import { BOARD_SIZE } from './geometry/vec'

export default function App() {
  const [started, setStarted] = useState(false)

  return (
    <>
      {/* Fixed logical board, scaled to fit and centered (letterboxed) on any screen. */}
      <svg
        className="board"
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
      />

      {!started && (
        <div className="overlay">
          <div className="card">
            <h1>PinPoint</h1>
            <p>Find the hidden blue circle in as few clicks as possible.</p>
            <button onClick={() => setStarted(true)}>Start</button>
          </div>
        </div>
      )}
    </>
  )
}
