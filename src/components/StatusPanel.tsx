import { Activity } from 'lucide-react'

interface StatusPanelProps {
  heading: string
  message: string
  complexity: string
  space?: string
}

export function StatusPanel({ heading, message, complexity, space }: StatusPanelProps) {
  return (
    <section className="status-panel" aria-label="Current algorithm status">
      <div className="status-kicker">
        <Activity aria-hidden="true" size={17} />
        {heading}
      </div>
      <p>{message}</p>
      <div className="complexity-row">
        <span>Time {complexity}</span>
        {space ? <span>Space {space}</span> : null}
      </div>
    </section>
  )
}
