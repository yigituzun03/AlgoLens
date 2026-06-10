import { BarChart3, Network } from 'lucide-react'

export type VisualizerMode = 'sorting' | 'pathfinding'

interface ModeTabsProps {
  mode: VisualizerMode
  onChange: (mode: VisualizerMode) => void
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="mode-tabs" aria-label="Visualizer mode">
      <button
        type="button"
        className={mode === 'sorting' ? 'mode-tab is-active' : 'mode-tab'}
        onClick={() => onChange('sorting')}
      >
        <BarChart3 aria-hidden="true" size={18} />
        Sorting
      </button>
      <button
        type="button"
        className={mode === 'pathfinding' ? 'mode-tab is-active' : 'mode-tab'}
        onClick={() => onChange('pathfinding')}
      >
        <Network aria-hidden="true" size={18} />
        Pathfinding
      </button>
    </div>
  )
}
