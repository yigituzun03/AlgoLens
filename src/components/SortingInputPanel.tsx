import type { SortingPreset } from '../data/samples'

interface SortingInputPanelProps {
  error?: string
  input: string
  lesson: string
  presets: SortingPreset[]
  selectedPresetId: string
  onApply: () => void
  onInputChange: (input: string) => void
  onPresetChange: (presetId: string) => void
}

export function SortingInputPanel({
  error,
  input,
  lesson,
  presets,
  selectedPresetId,
  onApply,
  onInputChange,
  onPresetChange,
}: SortingInputPanelProps) {
  return (
    <section className="input-panel" aria-label="Sorting input">
      <label className="field-label" htmlFor="sorting-preset">
        Example
      </label>
      <select
        id="sorting-preset"
        value={selectedPresetId}
        onChange={(event) => onPresetChange(event.target.value)}
      >
        <option value="custom">Custom input</option>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
      <p className="lesson-text">{lesson}</p>

      <label className="field-label" htmlFor="custom-values">
        Custom values
      </label>
      <textarea
        id="custom-values"
        rows={3}
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="8, 3, 5, 1, 9"
      />
      {error ? <p className="input-error">{error}</p> : null}
      <button type="button" className="secondary-action" onClick={onApply}>
        Apply input
      </button>
    </section>
  )
}
