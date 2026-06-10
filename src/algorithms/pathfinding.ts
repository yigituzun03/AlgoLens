import type {
  AlgorithmTeaching,
  Coordinate,
  GridCell,
  PathAlgorithmId,
  PathStep,
  PathfindingDefinition,
  PathfindingResult,
  TreeEdge,
} from './types'

interface SearchState {
  frontier: Coordinate[]
  visitedOrder: Coordinate[]
  cameFrom: Map<string, Coordinate>
  distance: Map<string, number>
  priority: Map<string, number>
  treeEdges: TreeEdge[]
}

const pathTeaching: Record<PathAlgorithmId, AlgorithmTeaching> = {
  bfs: {
    mentalModel: 'Explore outward in rings from the start.',
    dataStructure: 'Queue: first in, first out.',
    useWhen: 'Shortest path on unweighted grids or graphs.',
    watchFor: 'Every level is completed before moving deeper.',
    pseudocode: [
      'enqueue the start cell',
      'dequeue the oldest frontier cell',
      'mark it as visited',
      'enqueue each undiscovered neighbor',
      'reconstruct the route from parent links',
    ],
  },
  dfs: {
    mentalModel: 'Follow one branch as deep as possible before backing up.',
    dataStructure: 'Stack: last in, first out.',
    useWhen: 'Reachability, maze traversal, and recursion intuition.',
    watchFor: 'DFS may find a path quickly, but not necessarily the shortest one.',
    pseudocode: [
      'push the start cell',
      'pop the newest frontier cell',
      'mark it as visited',
      'push each undiscovered neighbor',
      'reconstruct the route from parent links',
    ],
  },
  dijkstra: {
    mentalModel: 'Always settle the currently cheapest known cell.',
    dataStructure: 'Priority queue ordered by total cost.',
    useWhen: 'Shortest paths when movement costs differ.',
    watchFor: 'Weighted cells can make a longer-looking route cheaper.',
    pseudocode: [
      'set start distance to zero',
      'choose the unsettled cell with lowest distance',
      'relax each neighbor edge',
      'update distance and predecessor if cheaper',
      'reconstruct the cheapest path',
    ],
  },
  astar: {
    mentalModel: 'Dijkstra with a compass: cost so far plus estimated distance.',
    dataStructure: 'Priority queue ordered by g + h.',
    useWhen: 'Fast shortest paths with a reliable heuristic.',
    watchFor: 'A good heuristic focuses the search without losing optimality.',
    pseudocode: [
      'score start with g = 0 and h estimate',
      'choose the lowest f = g + h cell',
      'relax each neighbor with real movement cost',
      'update priority with new g + h',
      'reconstruct the cheapest path',
    ],
  },
  greedy: {
    mentalModel: 'Move toward the target using only the heuristic.',
    dataStructure: 'Priority queue ordered by estimated distance.',
    useWhen: 'Teaching tradeoffs between speed and optimality.',
    watchFor: 'Greedy can be lured into a trap because it ignores path cost so far.',
    pseudocode: [
      'push the start cell',
      'choose the cell closest to the target estimate',
      'mark it as visited',
      'push undiscovered neighbors by heuristic',
      'trace the first route found',
    ],
  },
}

function coordinateKey(coordinate: Coordinate) {
  return `${coordinate.row},${coordinate.col}`
}

function sameCoordinate(left: Coordinate, right: Coordinate) {
  return left.row === right.row && left.col === right.col
}

function cloneCoordinate(coordinate: Coordinate): Coordinate {
  return { row: coordinate.row, col: coordinate.col }
}

function cloneCoordinates(coordinates: Coordinate[]) {
  return coordinates.map(cloneCoordinate)
}

function cloneEdge(edge: TreeEdge): TreeEdge {
  return {
    from: cloneCoordinate(edge.from),
    to: cloneCoordinate(edge.to),
  }
}

function findCell(grid: GridCell[][], kind: 'start' | 'end') {
  for (const row of grid) {
    for (const cell of row) {
      if (cell.kind === kind) {
        return { row: cell.row, col: cell.col }
      }
    }
  }

  throw new Error(`Grid is missing a ${kind} cell.`)
}

function getCell(grid: GridCell[][], coordinate: Coordinate) {
  return grid[coordinate.row]?.[coordinate.col]
}

function getNeighbors(grid: GridCell[][], coordinate: Coordinate) {
  const candidates: Coordinate[] = [
    { row: coordinate.row - 1, col: coordinate.col },
    { row: coordinate.row, col: coordinate.col + 1 },
    { row: coordinate.row + 1, col: coordinate.col },
    { row: coordinate.row, col: coordinate.col - 1 },
  ]

  return candidates.filter((candidate) => {
    const cell = getCell(grid, candidate)
    return Boolean(cell && cell.kind !== 'wall')
  })
}

function cellCost(grid: GridCell[][], coordinate: Coordinate) {
  return getCell(grid, coordinate)?.weight ?? 1
}

function manhattan(left: Coordinate, right: Coordinate) {
  return Math.abs(left.row - right.row) + Math.abs(left.col - right.col)
}

function reconstructPath(
  cameFrom: Map<string, Coordinate>,
  start: Coordinate,
  end: Coordinate,
) {
  const path: Coordinate[] = []
  let current = cloneCoordinate(end)

  if (!cameFrom.has(coordinateKey(end)) && !sameCoordinate(start, end)) {
    return path
  }

  path.push(cloneCoordinate(current))

  while (!sameCoordinate(current, start)) {
    const previous = cameFrom.get(coordinateKey(current))

    if (!previous) {
      return []
    }

    current = previous
    path.push(cloneCoordinate(current))
  }

  return path.reverse()
}

function pushPathStep(
  steps: PathStep[],
  state: SearchState,
  step: Pick<PathStep, 'message' | 'type'> &
    Partial<
      Pick<
        PathStep,
        | 'activeLine'
        | 'activeTreeEdge'
        | 'activeTreeNode'
        | 'current'
        | 'frontierKind'
        | 'path'
      >
    >,
) {
  const latestDistance = step.current
    ? state.distance.get(coordinateKey(step.current))
    : undefined

  steps.push({
    type: step.type,
    current: step.current ? cloneCoordinate(step.current) : undefined,
    frontier: cloneCoordinates(state.frontier),
    visited: cloneCoordinates(state.visitedOrder),
    path: cloneCoordinates(step.path ?? []),
    treeEdges: state.treeEdges.map(cloneEdge),
    message: step.message,
    distance: latestDistance ?? 0,
    visitedCount: state.visitedOrder.length,
    activeLine: step.activeLine,
    frontierKind: step.frontierKind,
    activeTreeNode: step.activeTreeNode
      ? cloneCoordinate(step.activeTreeNode)
      : step.current
        ? cloneCoordinate(step.current)
        : undefined,
    activeTreeEdge: step.activeTreeEdge ? cloneEdge(step.activeTreeEdge) : undefined,
  })
}

function createInitialState(start: Coordinate): SearchState {
  return {
    frontier: [cloneCoordinate(start)],
    visitedOrder: [],
    cameFrom: new Map(),
    distance: new Map([[coordinateKey(start), 0]]),
    priority: new Map([[coordinateKey(start), 0]]),
    treeEdges: [],
  }
}

function addTreeEdge(state: SearchState, from: Coordinate, to: Coordinate) {
  const edge = { from: cloneCoordinate(from), to: cloneCoordinate(to) }
  state.treeEdges.push(edge)
  return edge
}

function finishPathResult(
  id: PathAlgorithmId,
  name: string,
  complexity: string,
  steps: PathStep[],
  state: SearchState,
  start: Coordinate,
  end: Coordinate,
  found: boolean,
) {
  const path = found ? reconstructPath(state.cameFrom, start, end) : []
  const pathCost = found ? (state.distance.get(coordinateKey(end)) ?? 0) : 0

  if (path.length > 0) {
    for (let index = 0; index < path.length; index += 1) {
      pushPathStep(steps, state, {
        type: 'path',
        activeLine: 4,
        path: path.slice(0, index + 1),
        current: path[index],
        activeTreeNode: path[index],
        message: 'Trace the discovered route through parent links.',
      })
    }
  }

  pushPathStep(steps, state, {
    type: 'complete',
    activeLine: 4,
    path,
    current: found ? end : undefined,
    message: found ? 'Path found.' : 'No route reaches the target.',
  })

  return {
    id,
    name,
    complexity,
    teaching: pathTeaching[id],
    found,
    steps,
    path,
    visitedOrder: cloneCoordinates(state.visitedOrder),
    metrics: {
      visited: state.visitedOrder.length,
      pathLength: path.length,
      cost: pathCost,
      steps: steps.length,
    },
  } satisfies PathfindingResult
}

export function breadthFirstSearch(grid: GridCell[][]): PathfindingResult {
  const start = findCell(grid, 'start')
  const end = findCell(grid, 'end')
  const steps: PathStep[] = []
  const state = createInitialState(start)
  const discovered = new Set<string>([coordinateKey(start)])
  let found = false

  pushPathStep(steps, state, {
    type: 'initial',
    activeLine: 0,
    current: start,
    frontierKind: 'queue',
    message: 'Start with a FIFO queue.',
  })

  while (state.frontier.length > 0) {
    const current = state.frontier.shift()

    if (!current) {
      break
    }

    state.visitedOrder.push(current)
    pushPathStep(steps, state, {
      type: 'visit',
      activeLine: 1,
      current,
      frontierKind: 'queue',
      message: 'Dequeue and visit the oldest frontier cell.',
    })

    if (sameCoordinate(current, end)) {
      found = true
      break
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const key = coordinateKey(neighbor)

      if (discovered.has(key)) {
        continue
      }

      discovered.add(key)
      state.cameFrom.set(key, current)
      state.distance.set(key, (state.distance.get(coordinateKey(current)) ?? 0) + 1)
      state.priority.set(key, state.distance.get(key) ?? 0)
      const edge = addTreeEdge(state, current, neighbor)
      state.frontier.push(neighbor)
      pushPathStep(steps, state, {
        type: 'frontier',
        activeLine: 3,
        current: neighbor,
        activeTreeEdge: edge,
        frontierKind: 'queue',
        message: 'Add an undiscovered neighbor to the back of the queue.',
      })
    }
  }

  return finishPathResult(
    'bfs',
    'Breadth-First Search',
    'O(V + E)',
    steps,
    state,
    start,
    end,
    found,
  )
}

export function depthFirstSearch(grid: GridCell[][]): PathfindingResult {
  const start = findCell(grid, 'start')
  const end = findCell(grid, 'end')
  const steps: PathStep[] = []
  const state = createInitialState(start)
  const discovered = new Set<string>([coordinateKey(start)])
  let found = false

  pushPathStep(steps, state, {
    type: 'initial',
    activeLine: 0,
    current: start,
    frontierKind: 'stack',
    message: 'Start with a LIFO stack.',
  })

  while (state.frontier.length > 0) {
    const current = state.frontier.pop()

    if (!current) {
      break
    }

    state.visitedOrder.push(current)
    pushPathStep(steps, state, {
      type: 'visit',
      activeLine: 1,
      current,
      frontierKind: 'stack',
      message: 'Pop and visit the newest frontier cell.',
    })

    if (sameCoordinate(current, end)) {
      found = true
      break
    }

    const neighbors = getNeighbors(grid, current).reverse()

    for (const neighbor of neighbors) {
      const key = coordinateKey(neighbor)

      if (discovered.has(key)) {
        continue
      }

      discovered.add(key)
      state.cameFrom.set(key, current)
      state.distance.set(key, (state.distance.get(coordinateKey(current)) ?? 0) + 1)
      state.priority.set(key, state.distance.get(key) ?? 0)
      const edge = addTreeEdge(state, current, neighbor)
      state.frontier.push(neighbor)
      pushPathStep(steps, state, {
        type: 'frontier',
        activeLine: 3,
        current: neighbor,
        activeTreeEdge: edge,
        frontierKind: 'stack',
        message: 'Push an undiscovered neighbor onto the stack.',
      })
    }
  }

  return finishPathResult(
    'dfs',
    'Depth-First Search',
    'O(V + E)',
    steps,
    state,
    start,
    end,
    found,
  )
}

function weightedPrioritySearch(
  grid: GridCell[][],
  id: Extract<PathAlgorithmId, 'astar' | 'dijkstra' | 'greedy'>,
  name: string,
  complexity: string,
) {
  const start = findCell(grid, 'start')
  const end = findCell(grid, 'end')
  const steps: PathStep[] = []
  const state = createInitialState(start)
  const settled = new Set<string>()
  let found = false

  state.priority.set(coordinateKey(start), id === 'astar' ? manhattan(start, end) : 0)

  pushPathStep(steps, state, {
    type: 'initial',
    activeLine: 0,
    current: start,
    frontierKind: 'priority-queue',
    message:
      id === 'astar'
        ? 'Start with f = g + h.'
        : id === 'greedy'
          ? 'Start with a heuristic-only priority.'
          : 'Start with distance zero.',
  })

  while (state.frontier.length > 0) {
    state.frontier.sort((left, right) => {
      const leftPriority = state.priority.get(coordinateKey(left)) ?? Infinity
      const rightPriority = state.priority.get(coordinateKey(right)) ?? Infinity
      return leftPriority - rightPriority
    })

    const current = state.frontier.shift()

    if (!current) {
      break
    }

    const currentKey = coordinateKey(current)

    if (settled.has(currentKey)) {
      continue
    }

    settled.add(currentKey)
    state.visitedOrder.push(current)
    pushPathStep(steps, state, {
      type: 'visit',
      activeLine: id === 'greedy' ? 1 : 1,
      current,
      frontierKind: 'priority-queue',
      message:
        id === 'greedy'
          ? 'Visit the cell with the smallest heuristic estimate.'
          : 'Settle the cell with the lowest priority.',
    })

    if (sameCoordinate(current, end)) {
      found = true
      break
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const neighborKey = coordinateKey(neighbor)

      if (settled.has(neighborKey)) {
        continue
      }

      const currentDistance = state.distance.get(currentKey) ?? 0
      const candidateDistance = currentDistance + cellCost(grid, neighbor)
      const knownDistance = state.distance.get(neighborKey) ?? Infinity
      const shouldUpdate =
        id === 'greedy' ? !state.distance.has(neighborKey) : candidateDistance < knownDistance

      if (shouldUpdate) {
        state.distance.set(neighborKey, candidateDistance)
        state.cameFrom.set(neighborKey, current)

        const heuristic = manhattan(neighbor, end)
        const priority =
          id === 'dijkstra'
            ? candidateDistance
            : id === 'astar'
              ? candidateDistance + heuristic
              : heuristic

        state.priority.set(neighborKey, priority)
        const edge = addTreeEdge(state, current, neighbor)
        state.frontier.push(neighbor)
        pushPathStep(steps, state, {
          type: 'frontier',
          activeLine: id === 'greedy' ? 3 : 3,
          current: neighbor,
          activeTreeEdge: edge,
          frontierKind: 'priority-queue',
          message:
            id === 'dijkstra'
              ? 'Relax a cheaper route to this cell.'
              : id === 'astar'
                ? `Update this cell with g + h = ${candidateDistance} + ${heuristic}.`
                : `Add this neighbor with heuristic ${heuristic}.`,
        })
      }
    }
  }

  return finishPathResult(id, name, complexity, steps, state, start, end, found)
}

export function dijkstraSearch(grid: GridCell[][]): PathfindingResult {
  return weightedPrioritySearch(
    grid,
    'dijkstra',
    'Dijkstra',
    'O((V + E) log V)',
  )
}

export function aStarSearch(grid: GridCell[][]): PathfindingResult {
  return weightedPrioritySearch(
    grid,
    'astar',
    'A* Search',
    'O((V + E) log V)',
  )
}

export function greedyBestFirstSearch(grid: GridCell[][]): PathfindingResult {
  return weightedPrioritySearch(
    grid,
    'greedy',
    'Greedy Best-First Search',
    'O((V + E) log V)',
  )
}

export const pathfindingAlgorithms: PathfindingDefinition[] = [
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    summary: 'Explores in rings and finds shortest paths on unweighted grids.',
    complexity: 'O(V + E)',
    teaching: pathTeaching.bfs,
    run: breadthFirstSearch,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    summary: 'Explores deeply first, useful for traversal and reachability.',
    complexity: 'O(V + E)',
    teaching: pathTeaching.dfs,
    run: depthFirstSearch,
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra',
    summary: 'Finds the lowest-cost path when cells carry weights.',
    complexity: 'O((V + E) log V)',
    teaching: pathTeaching.dijkstra,
    run: dijkstraSearch,
  },
  {
    id: 'astar',
    name: 'A* Search',
    summary: 'Combines real cost and a goal-distance heuristic.',
    complexity: 'O((V + E) log V)',
    teaching: pathTeaching.astar,
    run: aStarSearch,
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    summary: 'Chases the goal estimate quickly, but may miss the cheapest path.',
    complexity: 'O((V + E) log V)',
    teaching: pathTeaching.greedy,
    run: greedyBestFirstSearch,
  },
]

export function runPathfindingAlgorithm(
  id: PathAlgorithmId,
  grid: GridCell[][],
): PathfindingResult {
  const algorithm = pathfindingAlgorithms.find((candidate) => candidate.id === id)

  if (!algorithm) {
    throw new Error(`Unknown pathfinding algorithm: ${id}`)
  }

  return algorithm.run(grid)
}
