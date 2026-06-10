import {
  BrickWall,
  Eraser,
  MapPinCheck,
  MapPinPlus,
  Square,
  Weight,
} from 'lucide-react'
import type { GridSizeId, PathPreset } from '../data/samples'

export type DrawTool = 'wall' | 'weight' | 'erase' | 'start' | 'end'

interface GridToolsPanelProps {
  drawTool: DrawTool
  gridSize: GridSizeId
  lesson: string
  presets: PathPreset[]
  selectedPresetId: string
  onDrawToolChange: (tool: DrawTool) => void
  onGridSizeChange: (size: GridSizeId) => void
  onPresetChange: (presetId: string) => void
}

const drawTools: Array<{
  icon: typeof BrickWall
  id: DrawTool
  label: string
}> = [
  { id: 'wall', label: 'Wall', icon: BrickWall },
  { id: 'weight', label: 'Weight', icon: Weight },
  { id: 'erase', label: 'Erase', icon: Eraser },
  { id: 'start', label: 'Start', icon: MapPinPlus },
  { id: 'end', label: 'End', icon: MapPinCheck },
]

export function GridToolsPanel({
  drawTool,
  gridSize,
  lesson,
  presets,
  selectedPresetId,
  onDrawToolChange,
  onGridSizeChange,
  onPresetChange,
}: GridToolsPanelProps) {
  return (
    <section className="input-panel" aria-label="Grid editor">
      <label className="field-label" htmlFor="path-preset">
        Scenario
      </label>
      <select
        id="path-preset"
        value={selectedPresetId}
        onChange={(event) => onPresetChange(event.target.value)}
      >
        <option value="custom">Custom grid</option>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
      <p className="lesson-text">{lesson}</p>

      <label className="field-label" htmlFor="grid-size">
        Grid size
      </label>
      <select
        id="grid-size"
        value={gridSize}
        onChange={(event) => onGridSizeChange(event.target.value as GridSizeId)}
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>

      <div className="draw-tools" aria-label="Draw tools">
        {drawTools.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              type="button"
              className={drawTool === tool.id ? 'draw-tool is-active' : 'draw-tool'}
              key={tool.id}
              onClick={() => onDrawToolChange(tool.id)}
              title={`Draw ${tool.label}`}
            >
              <Icon aria-hidden="true" size={16} />
              <span>{tool.label}</span>
            </button>
          )
        })}
      </div>
      <div className="grid-legend">
        <span>
          <Square aria-hidden="true" size={13} /> Click cells to edit the map.
        </span>
      </div>
    </section>
  )
}
