interface PseudocodePanelProps {
  activeLine?: number
  lines: string[]
}

export function PseudocodePanel({ activeLine, lines }: PseudocodePanelProps) {
  return (
    <section className="pseudocode-panel" aria-label="Pseudocode">
      <div className="panel-heading compact-heading">
        <span>Pseudocode</span>
        <strong>Step trace</strong>
      </div>
      <ol className="pseudocode-list">
        {lines.map((line, index) => (
          <li className={activeLine === index ? 'is-active' : ''} key={line}>
            <span>{index + 1}</span>
            <code>{line}</code>
          </li>
        ))}
      </ol>
    </section>
  )
}
