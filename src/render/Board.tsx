import type { MouseEvent } from 'react'
import type { Course } from '../game/course'
import type { CountedClick } from '../game/game'
import { BOARD_HEIGHT, BOARD_WIDTH } from '../game/board'
import type { Vec } from '../geometry/vec'

/** Marker radius in board units. */
const MARKER_RADIUS = 16

interface BoardProps {
  course: Course
  clicks: CountedClick[]
  revealTarget: boolean
  /** A click that landed in a wall; shown briefly so the player knows it didn't count. */
  rejected: { point: Vec; key: number } | null
  onBoardClick: (point: Vec) => void
}

export function Board({ course, clicks, revealTarget, rejected, onBoardClick }: BoardProps) {
  function handleClick(e: MouseEvent<SVGSVGElement>) {
    // Convert screen pixels to board units, accounting for scaling and cropping.
    const ctm = e.currentTarget.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    onBoardClick({ x: p.x, y: p.y })
  }

  return (
    <svg
      className="board"
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      // "slice" covers the whole window without stretching, cropping a little of the
      // board's edges if the window isn't 1.8 : 1 (see SAFE_AREA).
      preserveAspectRatio="xMidYMid slice"
      onClick={handleClick}
    >

      {course.walls.map((wall, i) => (
        // A round-capped stroke is exactly the wall's capsule shape.
        <line
          key={i}
          className="wall"
          x1={wall.a.x}
          y1={wall.a.y}
          x2={wall.b.x}
          y2={wall.b.y}
          strokeWidth={wall.thickness}
          strokeLinecap="round"
        />
      ))}

      {revealTarget && (
        <circle
          className="target"
          cx={course.target.center.x}
          cy={course.target.center.y}
          r={course.target.radius}
        />
      )}

      {clicks.map((click, i) => (
        <Marker key={i} click={click} />
      ))}

      {rejected && (
        <g key={rejected.key} transform={`translate(${rejected.point.x} ${rejected.point.y})`}>
          <path className="rejected" d="M -10 -10 L 10 10 M 10 -10 L -10 10" />
        </g>
      )}
    </svg>
  )
}

function Marker({ click }: { click: CountedClick }) {
  const { point, result } = click
  return (
    // Position on the outer group; the inner group animates around its own center.
    <g transform={`translate(${point.x} ${point.y})`}>
      <MarkerShape result={result} />
    </g>
  )
}

function MarkerShape({ result }: { result: CountedClick['result'] }) {
  if (result.kind === 'grey') {
    // Distinct shape (hollow with a cross), not just a color.
    const d = MARKER_RADIUS * 0.5
    return (
      <g className="marker marker-grey">
        <circle r={MARKER_RADIUS} />
        <path d={`M ${-d} ${-d} L ${d} ${d} M ${d} ${-d} L ${-d} ${d}`} />
      </g>
    )
  }

  if (result.kind === 'hit') {
    return (
      <g className="marker marker-hit">
        <circle r={MARKER_RADIUS} />
      </g>
    )
  }

  // Color shows the band; the distance level (1–20) is shown inside the dot,
  // which is more precise and means color is never the only signal.
  return (
    <g className={`marker marker-band band-${result.band}`}>
      <circle r={MARKER_RADIUS} />
      <text dy="0.35em">{result.level}</text>
    </g>
  )
}
