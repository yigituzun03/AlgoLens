import { GitBranch, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  pathfindingAlgorithms,
  runPathfindingAlgorithm,
} from './algorithms/pathfinding'
import { runSortingAlgorithm, sortingAlgorithms } from './algorithms/sorting'
import type {
  CellKind,
  GridCell,
  PathAlgorithmId,
  SortingAlgorithmId,
} from './algorithms/types'
import { ControlBar } from './components/ControlBar'
import {
  GridToolsPanel,
  type DrawTool,
} from './components/GridToolsPanel'
import { GuidePanel } from './components/GuidePanel'
import { LearnPanel } from './components/LearnPanel'
import { MetricsPanel, type MetricItem } from './components/MetricsPanel'
import { ModeTabs, type VisualizerMode } from './components/ModeTabs'
import { PathGrid } from './components/PathGrid'
import { PseudocodePanel } from './components/PseudocodePanel'
import { SortingCanvas } from './components/SortingCanvas'
import { SortingInputPanel } from './components/SortingInputPanel'
import { StatusPanel } from './components/StatusPanel'
import { TreeCanvas } from './components/TreeCanvas'
import { parseSortingInput } from './data/input'
import {
  createGeneratedGrid,
  createGridFromLayout,
  createOpenGrid,
  createSortingDataset,
  gridSizes,
  pathPresets,
  sortingPresets,
  type GridSizeId,
} from './data/samples'
import './App.css'

type PathView = 'grid' | 'split' | 'tree'

const firstSortingPreset = sortingPresets[0]
const firstPathPreset = pathPresets[0]

function speedToDelay(speed: number) {
  const delays = [850, 560, 360, 210, 90]
  return delays[Math.max(0, Math.min(delays.length - 1, speed - 1))]
}

function formatValues(values: number[]) {
  return values.join(', ')
}

function updateCellKind(cell: GridCell, kind: CellKind): GridCell {
  return {
    ...cell,
    kind,
    weight: kind === 'weight' ? 5 : 1,
  }
}

function App() {
  const [mode, setMode] = useState<VisualizerMode>('sorting')
  const [sortingAlgorithm, setSortingAlgorithm] =
    useState<SortingAlgorithmId>('insertion')
  const [pathAlgorithm, setPathAlgorithm] = useState<PathAlgorithmId>('bfs')
  const [sortingData, setSortingData] = useState(() => [...firstSortingPreset.values])
  const [sortingInput, setSortingInput] = useState(() =>
    formatValues(firstSortingPreset.values),
  )
  const [sortingInputError, setSortingInputError] = useState<string>()
  const [sortingLesson, setSortingLesson] = useState(firstSortingPreset.lesson)
  const [selectedSortingPresetId, setSelectedSortingPresetId] = useState(
    firstSortingPreset.id,
  )
  const [grid, setGrid] = useState(() => createGridFromLayout(firstPathPreset.layout))
  const [gridSize, setGridSize] = useState<GridSizeId>('medium')
  const [drawTool, setDrawTool] = useState<DrawTool>('wall')
  const [pathLesson, setPathLesson] = useState(firstPathPreset.lesson)
  const [selectedPathPresetId, setSelectedPathPresetId] = useState(firstPathPreset.id)
  const [pathView, setPathView] = useState<PathView>('split')
  const [stepIndex, setStepIndex] = useState(0)
  const [speed, setSpeed] = useState(3)
  const [isPlaying, setIsPlaying] = useState(false)

  const sortingResult = useMemo(
    () => runSortingAlgorithm(sortingAlgorithm, sortingData),
    [sortingAlgorithm, sortingData],
  )
  const pathResult = useMemo(
    () => runPathfindingAlgorithm(pathAlgorithm, grid),
    [grid, pathAlgorithm],
  )

  const activeSteps =
    mode === 'sorting' ? sortingResult.steps : pathResult.steps
  const boundedStepIndex = Math.min(stepIndex, activeSteps.length - 1)
  const activeStep = activeSteps[boundedStepIndex]

  useEffect(() => {
    if (!isPlaying || boundedStepIndex >= activeSteps.length - 1) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setStepIndex((current) => {
        const nextStep = Math.min(current + 1, activeSteps.length - 1)

        if (nextStep >= activeSteps.length - 1) {
          setIsPlaying(false)
        }

        return nextStep
      })
    }, speedToDelay(speed))

    return () => window.clearTimeout(timeoutId)
  }, [activeSteps.length, boundedStepIndex, isPlaying, speed])

  const metrics: MetricItem[] =
    mode === 'sorting'
      ? [
          {
            label: 'Comparisons',
            value: sortingResult.steps[boundedStepIndex]?.comparisons ?? 0,
            tone: 'blue',
          },
          {
            label: 'Swaps',
            value: sortingResult.steps[boundedStepIndex]?.swaps ?? 0,
            tone: 'amber',
          },
          {
            label: 'Writes',
            value: sortingResult.steps[boundedStepIndex]?.writes ?? 0,
            tone: 'green',
          },
          {
            label: 'Total steps',
            value: sortingResult.metrics.steps,
          },
        ]
      : [
          {
            label: 'Visited',
            value: pathResult.steps[boundedStepIndex]?.visitedCount ?? 0,
            tone: 'blue',
          },
          {
            label: 'Path length',
            value: pathResult.metrics.pathLength,
            tone: pathResult.found ? 'green' : 'red',
          },
          {
            label: 'Path cost',
            value: pathResult.metrics.cost,
            tone: 'amber',
          },
          {
            label: 'Tree edges',
            value: pathResult.steps[boundedStepIndex]?.treeEdges.length ?? 0,
          },
        ]

  const resetPlayback = () => {
    setStepIndex(0)
    setIsPlaying(false)
  }

  const handleRandomize = () => {
    const seed = Math.floor(Date.now() % 100_000)
    resetPlayback()

    if (mode === 'sorting') {
      const values = createSortingDataset(18, seed)
      setSortingData(values)
      setSortingInput(formatValues(values))
      setSortingInputError(undefined)
      setSelectedSortingPresetId('custom')
      setSortingLesson('Randomized values are useful for stress-testing how the same algorithm behaves across shapes.')
      return
    }

    const { cols, rows } = gridSizes[gridSize]
    setGrid(createGeneratedGrid(rows, cols, seed))
    setSelectedPathPresetId('custom')
    setPathLesson('Random maps help you compare how each algorithm reacts to walls and weights.')
  }

  const handleModeChange = (nextMode: VisualizerMode) => {
    resetPlayback()
    setMode(nextMode)
  }

  const handleTogglePlayback = () => {
    if (boundedStepIndex >= activeSteps.length - 1) {
      setStepIndex(0)
    }

    setIsPlaying((playing) => !playing)
  }

  const handleStepBack = () => {
    setIsPlaying(false)
    setStepIndex((current) => Math.max(0, current - 1))
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    setStepIndex((current) => Math.min(activeSteps.length - 1, current + 1))
  }

  const handleSortingPresetChange = (presetId: string) => {
    resetPlayback()

    if (presetId === 'custom') {
      setSelectedSortingPresetId('custom')
      return
    }

    const preset = sortingPresets.find((candidate) => candidate.id === presetId)

    if (!preset) {
      return
    }

    setSelectedSortingPresetId(preset.id)
    setSortingLesson(preset.lesson)
    setSortingData([...preset.values])
    setSortingInput(formatValues(preset.values))
    setSortingInputError(undefined)
  }

  const handleApplySortingInput = () => {
    const result = parseSortingInput(sortingInput)

    if (result.error) {
      setSortingInputError(result.error)
      return
    }

    resetPlayback()
    setSortingData(result.values)
    setSelectedSortingPresetId('custom')
    setSortingLesson('Custom input lets you test your own edge cases, including duplicates and almost-sorted data.')
    setSortingInputError(undefined)
  }

  const handlePathPresetChange = (presetId: string) => {
    resetPlayback()

    if (presetId === 'custom') {
      setSelectedPathPresetId('custom')
      return
    }

    const preset = pathPresets.find((candidate) => candidate.id === presetId)

    if (!preset) {
      return
    }

    setSelectedPathPresetId(preset.id)
    setPathLesson(preset.lesson)
    setGrid(createGridFromLayout(preset.layout))
  }

  const handleGridSizeChange = (size: GridSizeId) => {
    resetPlayback()
    setGridSize(size)
    setSelectedPathPresetId('custom')
    setPathLesson('A blank editable grid is best for building your own mental model from scratch.')
    setGrid(createOpenGrid(size))
  }

  const handleCellEdit = (target: GridCell) => {
    resetPlayback()
    setSelectedPathPresetId('custom')
    setPathLesson('You are editing the map directly; compare algorithms on exactly the same custom grid.')

    setGrid((currentGrid) => {
      if (
        (drawTool === 'start' && (target.kind === 'end' || target.kind === 'start')) ||
        (drawTool === 'end' && (target.kind === 'start' || target.kind === 'end'))
      ) {
        return currentGrid
      }

      return currentGrid.map((row) =>
        row.map((cell) => {
          const isTarget = cell.row === target.row && cell.col === target.col

          if (drawTool === 'start') {
            if (cell.kind === 'start') {
              return updateCellKind(cell, 'empty')
            }

            return isTarget ? updateCellKind(cell, 'start') : cell
          }

          if (drawTool === 'end') {
            if (cell.kind === 'end') {
              return updateCellKind(cell, 'empty')
            }

            return isTarget ? updateCellKind(cell, 'end') : cell
          }

          if (!isTarget || cell.kind === 'start' || cell.kind === 'end') {
            return cell
          }

          if (drawTool === 'wall') {
            return updateCellKind(cell, 'wall')
          }

          if (drawTool === 'weight') {
            return updateCellKind(cell, 'weight')
          }

          return updateCellKind(cell, 'empty')
        }),
      )
    })
  }

  const activeTitle =
    mode === 'sorting' ? sortingResult.name : pathResult.name
  const activeComplexity =
    mode === 'sorting' ? sortingResult.complexity : pathResult.complexity
  const activeSpace = mode === 'sorting' ? sortingResult.space : undefined
  const activeTeaching =
    mode === 'sorting' ? sortingResult.teaching : pathResult.teaching
  const activeLesson = mode === 'sorting' ? sortingLesson : pathLesson
  const activeLine = activeStep?.activeLine
  const stageOperation =
    mode === 'sorting'
      ? sortingResult.steps[boundedStepIndex]?.operation
      : pathResult.steps[boundedStepIndex]?.type

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <div>
            <h1>AlgoLens</h1>
            <p>Interactive algorithm visualizer for computer science fundamentals.</p>
          </div>
        </div>
        <a className="github-link" href="https://github.com/" target="_blank">
          <GitBranch aria-hidden="true" size={18} />
          GitHub ready
        </a>
      </header>

      <GuidePanel
        mode={mode}
        operation={stageOperation}
        teaching={activeTeaching}
      />

      <section className="workspace" aria-label="Algorithm visualizer">
        <aside className="sidebar">
          <ModeTabs mode={mode} onChange={handleModeChange} />
          <ControlBar
            algorithm={mode === 'sorting' ? sortingAlgorithm : pathAlgorithm}
            options={mode === 'sorting' ? sortingAlgorithms : pathfindingAlgorithms}
            isPlaying={isPlaying}
            speed={speed}
            stepIndex={boundedStepIndex}
            totalSteps={activeSteps.length}
            onAlgorithmChange={(algorithm) => {
              resetPlayback()

              if (mode === 'sorting') {
                setSortingAlgorithm(algorithm as SortingAlgorithmId)
                return
              }

              const nextAlgorithm = algorithm as PathAlgorithmId
              setPathAlgorithm(nextAlgorithm)
              setPathView(
                nextAlgorithm === 'bfs' || nextAlgorithm === 'dfs'
                  ? 'split'
                  : 'grid',
              )
            }}
            onRandomize={handleRandomize}
            onReset={resetPlayback}
            onSpeedChange={setSpeed}
            onStepBack={handleStepBack}
            onStepForward={handleStepForward}
            onTogglePlayback={handleTogglePlayback}
          />

          {mode === 'sorting' ? (
            <SortingInputPanel
              error={sortingInputError}
              input={sortingInput}
              lesson={sortingLesson}
              presets={sortingPresets}
              selectedPresetId={selectedSortingPresetId}
              onApply={handleApplySortingInput}
              onInputChange={setSortingInput}
              onPresetChange={handleSortingPresetChange}
            />
          ) : (
            <GridToolsPanel
              drawTool={drawTool}
              gridSize={gridSize}
              lesson={pathLesson}
              presets={pathPresets}
              selectedPresetId={selectedPathPresetId}
              onDrawToolChange={setDrawTool}
              onGridSizeChange={handleGridSizeChange}
              onPresetChange={handlePathPresetChange}
            />
          )}

          <MetricsPanel title={activeTitle} metrics={metrics} />
          <StatusPanel
            heading={activeTitle}
            message={activeStep?.message ?? 'Ready.'}
            complexity={activeComplexity}
            space={activeSpace}
          />
        </aside>

        <section className="content-stack">
          <section className="visual-stage">
            <div className="stage-header">
              <div>
                <span className="stage-kicker">
                  {mode === 'sorting' ? 'Sorting lab' : 'Pathfinding lab'}
                </span>
                <h2>{activeTitle}</h2>
              </div>
              <div className="stage-actions">
                {mode === 'pathfinding' ? (
                  <div className="view-switcher" aria-label="Path view">
                    {(['grid', 'split', 'tree'] as PathView[]).map((view) => (
                      <button
                        type="button"
                        className={pathView === view ? 'is-active' : ''}
                        key={view}
                        onClick={() => setPathView(view)}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                ) : null}
                <span className="stage-pill">{stageOperation ?? 'ready'}</span>
              </div>
            </div>

            {mode === 'sorting' ? (
              <SortingCanvas step={sortingResult.steps[boundedStepIndex]} />
            ) : (
              <div className={`path-stage path-view-${pathView}`}>
                {pathView !== 'tree' ? (
                  <PathGrid
                    grid={grid}
                    isEditable
                    step={pathResult.steps[boundedStepIndex]}
                    onCellClick={handleCellEdit}
                  />
                ) : null}
                {pathView !== 'grid' ? (
                  <TreeCanvas step={pathResult.steps[boundedStepIndex]} />
                ) : null}
              </div>
            )}
          </section>

          <section className="education-grid" aria-label="Educational details">
            <LearnPanel
              currentMessage={activeStep?.message ?? 'Ready.'}
              lesson={activeLesson}
              teaching={activeTeaching}
            />
            <PseudocodePanel
              activeLine={activeLine}
              lines={activeTeaching.pseudocode}
            />
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
