import type { GridCell } from '../algorithms/types'

export interface SortingPreset {
  id: string
  name: string
  lesson: string
  values: number[]
}

export interface PathPreset {
  id: string
  name: string
  lesson: string
  layout: string[]
}

export type GridSizeId = 'small' | 'medium' | 'large'

export const gridSizes: Record<GridSizeId, { cols: number; rows: number }> = {
  small: { rows: 8, cols: 12 },
  medium: { rows: 12, cols: 18 },
  large: { rows: 16, cols: 24 },
}

export const sortingPresets: SortingPreset[] = [
  {
    id: 'nearly-sorted',
    name: 'Nearly sorted',
    lesson: 'Insertion Sort shines here because most keys move only a little.',
    values: [12, 18, 24, 31, 29, 36, 45, 51, 57, 62, 60, 70, 78, 84],
  },
  {
    id: 'reversed',
    name: 'Reversed',
    lesson: 'Quadratic algorithms do their hardest work when everything is backwards.',
    values: [96, 88, 82, 75, 68, 61, 54, 47, 40, 33, 26, 19],
  },
  {
    id: 'many-duplicates',
    name: 'Many duplicates',
    lesson: 'Duplicates reveal whether an algorithm does unnecessary movement.',
    values: [42, 17, 42, 9, 17, 63, 42, 9, 71, 17, 63, 9, 42, 71],
  },
  {
    id: 'random-small',
    name: 'Random small',
    lesson: 'A compact random set is perfect for stepping through every decision.',
    values: [37, 12, 84, 29, 53, 18, 76, 45, 8, 61],
  },
  {
    id: 'few-unique',
    name: 'Few unique values',
    lesson: 'Repeated values make partitioning and stable merging easier to compare.',
    values: [20, 80, 20, 60, 40, 80, 60, 20, 40, 80, 60, 40, 20],
  },
]

export const pathPresets: PathPreset[] = [
  {
    id: 'bfs-dfs-maze',
    name: 'BFS vs DFS maze',
    lesson: 'BFS expands by levels; DFS dives into branches and may wander before finding the target.',
    layout: [
      'S.................',
      '.#####....###.....',
      '...W..W.......W...',
      '...#..#####.......',
      '...#......W.......',
      '...#######....###.',
      '...........W......',
      '.###.######..W....',
      '...#...........#..',
      '...#.W.#####...#..',
      '...#...........#E.',
      '..................',
    ],
  },
  {
    id: 'weighted-detour',
    name: 'Weighted detour',
    lesson: 'Dijkstra and A* prefer a longer-looking route when it has a lower total cost.',
    layout: [
      'S....WWWW....E',
      '.###.W..W.###.',
      '....W..W......',
      '....W..W.###..',
      '..............',
      '.##########...',
      '..............',
    ],
  },
  {
    id: 'no-path',
    name: 'No path',
    lesson: 'A complete search is also useful when it proves that no route exists.',
    layout: [
      'S....',
      '#####',
      '....E',
      '.....',
      '.....',
    ],
  },
  {
    id: 'greedy-trap',
    name: 'Greedy trap',
    lesson: 'Greedy Best-First can chase the target and get pulled into a costly corridor.',
    layout: [
      'S.............E',
      '.WWWWWWWWWWW...',
      '...........W...',
      '.#########.W...',
      '.........#.W...',
      '.W.W.W.W.#.....',
      '.W.....W.......',
      '...............',
    ],
  },
  {
    id: 'open-field',
    name: 'Open field',
    lesson: 'An open map makes frontier behavior easy to see without obstacle noise.',
    layout: [
      'S...........',
      '............',
      '....W.......',
      '............',
      '.......W....',
      '............',
      '...........E',
    ],
  },
  {
    id: 'narrow-bridge',
    name: 'Narrow bridge',
    lesson: 'A single bridge shows how algorithms commit to constrained passages.',
    layout: [
      'S.....#.....',
      '#####.#.####',
      '.....W#.....',
      '.#####.####.',
      '.......W..E.',
      '.##########.',
      '............',
    ],
  },
]

function nextRandom(seed: number) {
  return (seed * 1664525 + 1013904223) >>> 0
}

export function createSortingDataset(size = 26, seed = 42) {
  const values: number[] = []
  let currentSeed = seed

  for (let index = 0; index < size; index += 1) {
    currentSeed = nextRandom(currentSeed)
    values.push(12 + (currentSeed % 86))
  }

  return values
}

export function createGridFromLayout(layout: string[]): GridCell[][] {
  const width = layout[0]?.length ?? 0

  if (width === 0) {
    throw new Error('Grid layout cannot be empty.')
  }

  let hasStart = false
  let hasEnd = false

  const grid = layout.map((line, row) => {
    if (line.length !== width) {
      throw new Error('Grid layout rows must be the same width.')
    }

    return [...line].map((symbol, col) => {
      const base = { row, col, weight: 1 }

      if (symbol === 'S') {
        hasStart = true
        return { ...base, kind: 'start' as const }
      }

      if (symbol === 'E') {
        hasEnd = true
        return { ...base, kind: 'end' as const }
      }

      if (symbol === '#') {
        return { ...base, kind: 'wall' as const }
      }

      if (symbol === 'W') {
        return { ...base, kind: 'weight' as const, weight: 5 }
      }

      return { ...base, kind: 'empty' as const }
    })
  })

  if (!hasStart || !hasEnd) {
    throw new Error('Grid layout requires one start and one end cell.')
  }

  return grid
}

export function createOpenGrid(size: GridSizeId = 'medium') {
  const { cols, rows } = gridSizes[size]

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col): GridCell => {
      if (row === 1 && col === 1) {
        return { row, col, kind: 'start', weight: 1 }
      }

      if (row === rows - 2 && col === cols - 2) {
        return { row, col, kind: 'end', weight: 1 }
      }

      return { row, col, kind: 'empty', weight: 1 }
    }),
  )
}

export function createShowcaseGrid() {
  return createGridFromLayout(pathPresets[0].layout)
}

export function createGeneratedGrid(rows = 12, cols = 18, seed = 97) {
  const start = { row: 1, col: 1 }
  const end = { row: rows - 2, col: cols - 2 }
  let currentSeed = seed

  const grid: GridCell[][] = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      currentSeed = nextRandom(currentSeed)
      const roll = currentSeed / 0xffffffff
      const isBorder = row === 0 || col === 0 || row === rows - 1 || col === cols - 1
      const isCarvedRoute =
        (row === start.row && col >= start.col && col <= end.col) ||
        (col === end.col && row >= start.row && row <= end.row)

      if (row === start.row && col === start.col) {
        return { row, col, kind: 'start', weight: 1 }
      }

      if (row === end.row && col === end.col) {
        return { row, col, kind: 'end', weight: 1 }
      }

      if (!isBorder && !isCarvedRoute && roll < 0.18) {
        return { row, col, kind: 'wall', weight: 1 }
      }

      if (!isCarvedRoute && roll >= 0.18 && roll < 0.3) {
        return { row, col, kind: 'weight', weight: 5 }
      }

      return { row, col, kind: 'empty', weight: 1 }
    }),
  )

  return grid
}
