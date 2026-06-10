import { BookOpen, Database, Target } from 'lucide-react'
import type { AlgorithmTeaching } from '../algorithms/types'

interface LearnPanelProps {
  currentMessage: string
  lesson: string
  teaching: AlgorithmTeaching
}

export function LearnPanel({ currentMessage, lesson, teaching }: LearnPanelProps) {
  return (
    <section className="learn-panel" aria-label="Learning notes">
      <div className="panel-heading compact-heading">
        <span>Learn</span>
        <strong>Beginner lens</strong>
      </div>
      <article className="learn-card">
        <BookOpen aria-hidden="true" size={18} />
        <div>
          <span>Mental model</span>
          <p>{teaching.mentalModel}</p>
        </div>
      </article>
      <article className="learn-card">
        <Database aria-hidden="true" size={18} />
        <div>
          <span>Data structure</span>
          <p>{teaching.dataStructure}</p>
        </div>
      </article>
      <article className="learn-card">
        <Target aria-hidden="true" size={18} />
        <div>
          <span>Now happening</span>
          <p>{currentMessage}</p>
        </div>
      </article>
      <article className="learn-card">
        <BookOpen aria-hidden="true" size={18} />
        <div>
          <span>What to notice</span>
          <p>{teaching.watchFor}</p>
        </div>
      </article>
      <article className="learn-card">
        <Database aria-hidden="true" size={18} />
        <div>
          <span>Use when</span>
          <p>{teaching.useWhen}</p>
        </div>
      </article>
      <div className="lesson-callout">
        <span>Example lesson</span>
        <p>{lesson || teaching.watchFor}</p>
      </div>
    </section>
  )
}
