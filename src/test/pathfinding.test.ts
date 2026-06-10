import { describe, expect, it } from 'vitest'
import {
  aStarSearch,
  dijkstraSearch,
  greedyBestFirstSearch,
  pathfindingAlgorithms,
  runPathfindingAlgorithm,
} from '../algorithms/pathfinding'
import type { PathAlgorithmId } from '../algorithms/types'
import { createGridFromLayout } from '../data/samples'

describe('pathfinding algorithms', () => {
  it.each(pathfindingAlgorithms)('finds a reachable path with $name', (algorithm) => {
    const grid = createGridFromLayout(['S..', '.#.', '..E'])
    const result = runPathfindingAlgorithm(algorithm.id as PathAlgorithmId, grid)

    expect(result.found).toBe(true)
    expect(result.path.length).toBeGreaterThan(0)
    expect(result.steps.at(0)?.type).toBe('initial')
    expect(result.steps.at(-1)?.type).toBe('complete')
  })

  it('reports a blocked path', () => {
    const grid = createGridFromLayout(['S#E'])
    for (const algorithm of pathfindingAlgorithms) {
      const result = runPathfindingAlgorithm(algorithm.id as PathAlgorithmId, grid)

      expect(result.found).toBe(false)
      expect(result.path).toEqual([])
      expect(result.metrics.pathLength).toBe(0)
    }
  })

  it('uses weighted cost with Dijkstra', () => {
    const grid = createGridFromLayout(['S.WE', '....'])
    const result = dijkstraSearch(grid)
    const includesWeightCell = result.path.some(
      (coordinate) => coordinate.row === 0 && coordinate.col === 2,
    )

    expect(result.found).toBe(true)
    expect(includesWeightCell).toBe(false)
    expect(result.metrics.cost).toBe(5)
  })

  it('matches Dijkstra cost with A* on an admissible Manhattan heuristic', () => {
    const grid = createGridFromLayout(['S.WE', '....'])

    expect(aStarSearch(grid).metrics.cost).toBe(dijkstraSearch(grid).metrics.cost)
  })

  it('emits traversal tree edges for BFS and DFS', () => {
    const grid = createGridFromLayout(['S..', '...', '..E'])
    const bfs = runPathfindingAlgorithm('bfs', grid)
    const dfs = runPathfindingAlgorithm('dfs', grid)

    expect(bfs.steps.some((step) => step.treeEdges.length > 0)).toBe(true)
    expect(dfs.steps.some((step) => step.treeEdges.length > 0)).toBe(true)
  })

  it('returns a valid route for Greedy Best-First Search when one exists', () => {
    const grid = createGridFromLayout(['S..', '.#.', '..E'])
    const result = greedyBestFirstSearch(grid)

    expect(result.found).toBe(true)
    expect(result.path.at(0)).toEqual({ row: 0, col: 0 })
    expect(result.path.at(-1)).toEqual({ row: 2, col: 2 })
  })
})
