export interface AlgorithmTeaching {
  mentalModel: string
  dataStructure: string
  useWhen: string
  watchFor: string
  pseudocode: string[]
}

export type SortingAlgorithmId =
  | 'bubble'
  | 'merge'
  | 'quick'
  | 'insertion'
  | 'selection'
  | 'heap'

export type SortOperation =
  | 'initial'
  | 'compare'
  | 'swap'
  | 'overwrite'
  | 'partition'
  | 'select'
  | 'insert'
  | 'shift'
  | 'heapify'
  | 'complete'

export interface SortStep {
  array: number[]
  active: number[]
  sorted: number[]
  operation: SortOperation
  message: string
  comparisons: number
  swaps: number
  writes: number
  activeLine?: number
  pivot?: number
}

export interface SortMetrics {
  comparisons: number
  swaps: number
  writes: number
  steps: number
}

export interface SortingResult {
  id: SortingAlgorithmId
  name: string
  complexity: string
  space: string
  teaching: AlgorithmTeaching
  steps: SortStep[]
  finalArray: number[]
  metrics: SortMetrics
}

export interface SortingDefinition {
  id: SortingAlgorithmId
  name: string
  summary: string
  complexity: string
  space: string
  teaching: AlgorithmTeaching
  run: (input: number[]) => SortingResult
}

export type PathAlgorithmId = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'greedy'

export type CellKind = 'empty' | 'wall' | 'weight' | 'start' | 'end'

export interface Coordinate {
  row: number
  col: number
}

export interface TreeEdge {
  from: Coordinate
  to: Coordinate
}

export interface GridCell extends Coordinate {
  kind: CellKind
  weight: number
}

export type PathStepType =
  | 'initial'
  | 'frontier'
  | 'visit'
  | 'path'
  | 'complete'

export interface PathStep {
  type: PathStepType
  current?: Coordinate
  frontier: Coordinate[]
  visited: Coordinate[]
  path: Coordinate[]
  treeEdges: TreeEdge[]
  message: string
  distance: number
  visitedCount: number
  activeLine?: number
  frontierKind?: 'queue' | 'stack' | 'priority-queue'
  activeTreeNode?: Coordinate
  activeTreeEdge?: TreeEdge
}

export interface PathMetrics {
  visited: number
  pathLength: number
  cost: number
  steps: number
}

export interface PathfindingResult {
  id: PathAlgorithmId
  name: string
  complexity: string
  teaching: AlgorithmTeaching
  found: boolean
  steps: PathStep[]
  path: Coordinate[]
  visitedOrder: Coordinate[]
  metrics: PathMetrics
}

export interface PathfindingDefinition {
  id: PathAlgorithmId
  name: string
  summary: string
  complexity: string
  teaching: AlgorithmTeaching
  run: (grid: GridCell[][]) => PathfindingResult
}
