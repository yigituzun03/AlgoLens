import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('AlgoLens UI flows', () => {
  it('applies custom sorting input to the bar visualization', () => {
    const { container } = render(<App />)

    fireEvent.change(screen.getByLabelText('Custom values'), {
      target: { value: '4, 3, 2, 1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply input' }))

    expect(container.querySelectorAll('.array-bar')).toHaveLength(4)
  })

  it('keeps a single start cell when editing the grid', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Pathfinding' }))
    fireEvent.click(screen.getByTitle('Draw Start'))

    const editableCells = container.querySelectorAll('.grid-cell.cell-empty')
    const target = editableCells.item(3)

    fireEvent.click(target)

    expect(container.querySelectorAll('.grid-cell.cell-start')).toHaveLength(1)
    expect(container.querySelectorAll('.grid-cell.cell-end')).toHaveLength(1)
  })

  it('shows split tree controls for pathfinding', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Pathfinding' }))

    expect(screen.getByRole('button', { name: 'split' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'tree' })).toBeTruthy()
    expect(container.querySelector('.tree-canvas')).toBeTruthy()
  })

  it('keeps autoplay moving after Start is pressed', async () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(screen.queryByText('Step 1 / 45')).toBeNull()
    expect(screen.getByText(/Step [3-9] \/ 45/)).toBeTruthy()
  })
})
