import { BookOpenCheck, Compass, Play, Radar, Sparkles } from 'lucide-react'
import type { AlgorithmTeaching } from '../algorithms/types'
import type { VisualizerMode } from './ModeTabs'

interface GuidePanelProps {
  mode: VisualizerMode
  operation?: string
  teaching: AlgorithmTeaching
}

export function GuidePanel({ mode, operation, teaching }: GuidePanelProps) {
  const modeCopy =
    mode === 'sorting'
      ? 'Watch the bars as values compare, shift, swap, and lock into place.'
      : 'Watch the frontier, visited cells, final path, and traversal tree evolve together.'

  return (
    <section className="mission-briefing" aria-label="How to use AlgoLens">
      <div className="briefing-copy">
        <span className="briefing-kicker">
          <Sparkles aria-hidden="true" size={15} />
          Mission briefing
        </span>
        <h2>Run the algorithm, then read the trace like a flight log.</h2>
        <p>{modeCopy}</p>
      </div>
      <div className="briefing-steps">
        <article>
          <Compass aria-hidden="true" size={18} />
          <span>1</span>
          <strong>Choose</strong>
          <p>Pick a mode, algorithm, and example.</p>
        </article>
        <article>
          <Play aria-hidden="true" size={18} />
          <span>2</span>
          <strong>Launch</strong>
          <p>Press Start or step through manually.</p>
        </article>
        <article>
          <BookOpenCheck aria-hidden="true" size={18} />
          <span>3</span>
          <strong>Decode</strong>
          <p>Match the animation to the highlighted pseudocode.</p>
        </article>
        <article>
          <Radar aria-hidden="true" size={18} />
          <span>Now</span>
          <strong>{operation ?? 'ready'}</strong>
          <p>{teaching.watchFor}</p>
        </article>
      </div>
    </section>
  )
}
