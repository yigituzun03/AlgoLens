export interface MetricItem {
  label: string
  value: string | number
  tone?: 'blue' | 'green' | 'amber' | 'red'
}

interface MetricsPanelProps {
  title: string
  metrics: MetricItem[]
}

export function MetricsPanel({ title, metrics }: MetricsPanelProps) {
  return (
    <section className="metrics-panel" aria-label={title}>
      <div className="panel-heading">
        <span>Live metrics</span>
        <strong>{title}</strong>
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <article
            className={`metric-card ${metric.tone ? `tone-${metric.tone}` : ''}`}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
