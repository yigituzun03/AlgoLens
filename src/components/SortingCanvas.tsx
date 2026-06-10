import type { CSSProperties } from 'react'
import type { SortStep } from '../algorithms/types'

interface SortingCanvasProps {
  step: SortStep
}

export function SortingCanvas({ step }: SortingCanvasProps) {
  const maxValue = Math.max(...step.array, 1)
  const active = new Set(step.active)
  const sorted = new Set(step.sorted)

  return (
    <div
      className="sorting-canvas"
      style={{ '--bar-count': step.array.length } as CSSProperties}
      aria-label="Sorting visualization"
    >
      {step.array.map((value, index) => {
        const style = {
          '--bar-height': `${Math.max(8, (value / maxValue) * 100)}%`,
        } as CSSProperties
        const classes = [
          'array-bar',
          active.has(index) ? 'is-active' : '',
          sorted.has(index) ? 'is-sorted' : '',
          step.pivot === index ? 'is-pivot' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div className="bar-slot" key={`${index}-${value}`}>
            <div className={classes} style={style}>
              <span>{value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
