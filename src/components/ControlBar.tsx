import {
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  StepBack,
  StepForward,
} from 'lucide-react'

export interface SelectOption<T extends string> {
  id: T
  name: string
  summary: string
}

interface ControlBarProps<T extends string> {
  algorithm: T
  options: SelectOption<T>[]
  isPlaying: boolean
  speed: number
  stepIndex: number
  totalSteps: number
  onAlgorithmChange: (algorithm: T) => void
  onRandomize: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  onStepBack: () => void
  onStepForward: () => void
  onTogglePlayback: () => void
}

export function ControlBar<T extends string>({
  algorithm,
  options,
  isPlaying,
  speed,
  stepIndex,
  totalSteps,
  onAlgorithmChange,
  onRandomize,
  onReset,
  onSpeedChange,
  onStepBack,
  onStepForward,
  onTogglePlayback,
}: ControlBarProps<T>) {
  const activeOption = options.find((option) => option.id === algorithm) ?? options[0]
  const progress = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0

  return (
    <section className="control-panel" aria-label="Visualization controls">
      <label className="field-label" htmlFor="algorithm-select">
        Algorithm
      </label>
      <select
        id="algorithm-select"
        value={algorithm}
        onChange={(event) => onAlgorithmChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>

      <p className="algorithm-summary">{activeOption?.summary}</p>

      <div className="button-row">
        <button
          type="button"
          className="primary-action"
          onClick={onTogglePlayback}
          title={isPlaying ? 'Pause animation' : 'Start animation'}
        >
          {isPlaying ? <Pause aria-hidden="true" size={18} /> : <Play aria-hidden="true" size={18} />}
          {isPlaying ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          className="icon-action"
          disabled={stepIndex <= 0}
          onClick={onStepBack}
          title="Step backward"
        >
          <StepBack aria-hidden="true" size={18} />
        </button>
        <button
          type="button"
          className="icon-action"
          disabled={stepIndex >= totalSteps - 1}
          onClick={onStepForward}
          title="Step forward"
        >
          <StepForward aria-hidden="true" size={18} />
        </button>
        <button type="button" className="icon-action" onClick={onReset} title="Reset animation">
          <RotateCcw aria-hidden="true" size={18} />
        </button>
        <button type="button" className="icon-action" onClick={onRandomize} title="Generate new input">
          <Shuffle aria-hidden="true" size={18} />
        </button>
      </div>

      <label className="field-label speed-label" htmlFor="speed-range">
        <Gauge aria-hidden="true" size={17} />
        Speed
      </label>
      <input
        id="speed-range"
        min="1"
        max="5"
        step="1"
        type="range"
        value={speed}
        onChange={(event) => onSpeedChange(Number(event.target.value))}
      />

      <div className="progress-line">
        <span>
          Step {Math.min(stepIndex + 1, totalSteps)} / {totalSteps}
        </span>
        <strong>{progress}%</strong>
      </div>
    </section>
  )
}
