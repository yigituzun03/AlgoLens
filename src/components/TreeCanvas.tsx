import type { Coordinate, PathStep, TreeEdge } from '../algorithms/types'

interface TreeCanvasProps {
  step: PathStep
}

interface TreeNode extends Coordinate {
  depth: number
  id: string
  x: number
  y: number
}

function keyOf(coordinate: Coordinate) {
  return `${coordinate.row},${coordinate.col}`
}

function edgeKey(edge: TreeEdge) {
  return `${keyOf(edge.from)}>${keyOf(edge.to)}`
}

export function TreeCanvas({ step }: TreeCanvasProps) {
  const nodeMap = new Map<string, Coordinate>()
  const parentMap = new Map<string, string>()

  for (const edge of step.treeEdges) {
    const fromKey = keyOf(edge.from)
    const toKey = keyOf(edge.to)
    nodeMap.set(fromKey, edge.from)
    nodeMap.set(toKey, edge.to)
    parentMap.set(toKey, fromKey)
  }

  for (const coordinate of [...step.visited, ...step.frontier, ...step.path]) {
    nodeMap.set(keyOf(coordinate), coordinate)
  }

  const depthCache = new Map<string, number>()
  const getDepth = (id: string): number => {
    const cached = depthCache.get(id)

    if (cached !== undefined) {
      return cached
    }

    const parent = parentMap.get(id)
    const depth = parent ? getDepth(parent) + 1 : 0
    depthCache.set(id, depth)
    return depth
  }

  const byDepth = new Map<number, string[]>()

  for (const id of nodeMap.keys()) {
    const depth = getDepth(id)
    byDepth.set(depth, [...(byDepth.get(depth) ?? []), id])
  }

  const nodes = new Map<string, TreeNode>()
  const maxBreadth = Math.max(1, ...Array.from(byDepth.values()).map((ids) => ids.length))
  const maxDepth = Math.max(1, ...Array.from(byDepth.keys()))
  const width = Math.max(720, maxBreadth * 86)
  const height = Math.max(320, (maxDepth + 1) * 86)

  for (const [depth, ids] of byDepth) {
    ids.forEach((id, index) => {
      const coordinate = nodeMap.get(id)

      if (!coordinate) {
        return
      }

      const gap = width / (ids.length + 1)
      nodes.set(id, {
        ...coordinate,
        depth,
        id,
        x: gap * (index + 1),
        y: 44 + depth * 78,
      })
    })
  }

  const pathSet = new Set(step.path.map(keyOf))
  const activeNode = step.activeTreeNode ? keyOf(step.activeTreeNode) : ''
  const activeEdge = step.activeTreeEdge ? edgeKey(step.activeTreeEdge) : ''

  if (nodes.size === 0) {
    return (
      <div className="tree-empty">
        Run BFS or DFS to build a traversal tree.
      </div>
    )
  }

  return (
    <div className="tree-canvas" aria-label="Traversal tree visualization">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {step.treeEdges.map((edge) => {
          const from = nodes.get(keyOf(edge.from))
          const to = nodes.get(keyOf(edge.to))

          if (!from || !to) {
            return null
          }

          const classes = [
            'tree-edge',
            pathSet.has(keyOf(edge.from)) && pathSet.has(keyOf(edge.to)) ? 'is-path' : '',
            edgeKey(edge) === activeEdge ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <line
              className={classes}
              key={edgeKey(edge)}
              x1={from.x}
              x2={to.x}
              y1={from.y}
              y2={to.y}
            />
          )
        })}
        {Array.from(nodes.values()).map((node) => {
          const classes = [
            'tree-node',
            pathSet.has(node.id) ? 'is-path' : '',
            activeNode === node.id ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <g className={classes} key={node.id}>
              <circle cx={node.x} cy={node.y} r="18" />
              <text x={node.x} y={node.y + 4}>
                {node.row + 1},{node.col + 1}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
