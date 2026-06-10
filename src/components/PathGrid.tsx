import type { CSSProperties } from 'react'
import type { Coordinate, GridCell, PathStep } from '../algorithms/types'

interface PathGridProps {
  grid: GridCell[][]
  isEditable?: boolean
  onCellClick?: (cell: GridCell) => void
  step: PathStep
}

function keyOf(coordinate: Coordinate) {
  return `${coordinate.row},${coordinate.col}`
}

export function PathGrid({ grid, isEditable = false, onCellClick, step }: PathGridProps) {
  const visited = new Set(step.visited.map(keyOf))
  const frontier = new Set(step.frontier.map(keyOf))
  const path = new Set(step.path.map(keyOf))
  const current = step.current ? keyOf(step.current) : ''
  const columnCount = grid[0]?.length ?? 1

  return (
    <div
      className="path-grid"
      style={{ '--grid-cols': columnCount } as CSSProperties}
      aria-label="Pathfinding grid"
    >
      {grid.flat().map((cell) => {
        const cellKey = keyOf(cell)
        const classes = [
          'grid-cell',
          `cell-${cell.kind}`,
          visited.has(cellKey) ? 'is-visited' : '',
          frontier.has(cellKey) ? 'is-frontier' : '',
          path.has(cellKey) ? 'is-path' : '',
          current === cellKey ? 'is-current' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            type="button"
            className={classes}
            disabled={!isEditable}
            key={cellKey}
            onClick={() => onCellClick?.(cell)}
            title={`Row ${cell.row + 1}, column ${cell.col + 1}`}
          />
        )
      })}
    </div>
  )
}
