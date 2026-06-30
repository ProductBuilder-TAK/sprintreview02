// @ts-expect-error — JS service
import { formatNumber } from '@/utils/formatters.js'

interface SpCompletionBlockProps {
  currentDelivered: number
  currentCommitted: number
  currentCompletion: number
  currentSprintLabel: string
  avgDelivered?: number
  avgCompletion?: number
  previousSprintsCount?: number
  recommendedVelocity?: number
}

function getCompletionClass(pct: number): string {
  if (pct >= 90) return 'success'
  if (pct < 70) return 'danger'
  return 'warning'
}

function pillClass(cls: string): string {
  return cls === 'success' ? 'ok' : cls === 'danger' ? 'bad' : 'warn'
}

export function SpCompletionBlock({
  currentDelivered,
  currentCommitted,
  currentCompletion,
  currentSprintLabel,
  avgDelivered,
  avgCompletion,
  previousSprintsCount,
  recommendedVelocity,
}: SpCompletionBlockProps) {
  const totalClass = getCompletionClass(currentCompletion)

  return (
    <div className="sp" style={{ border: '1px solid var(--color-line)' }}>
      <div>
        <div className="eyebrow">Story points livrés</div>
        <div className="sp__hero">
          <span className="v tnum">{currentDelivered}</span>
          <span className="frac">/ {currentCommitted} engagés</span>
        </div>
      </div>

      <div className="sp__bar">
        <div className="sp__bar-fill" style={{ width: `${currentCompletion}%` }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '8px 0 4px' }}>
        <span className="dek">Complétion</span>
        <span className="tnum" style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 500, lineHeight: 1 }}>
          {currentCompletion}%
        </span>
        <span className={`pill pill--${pillClass(totalClass)}`} style={{ fontSize: 10, padding: '2px 8px' }}>
          {currentSprintLabel || 'Sprint actuel'}
        </span>
      </div>

      <div className="sp__rows">
        {previousSprintsCount && previousSprintsCount > 0 && (
          <>
            <div className="sp__row">
              <span>Moyenne {previousSprintsCount} sprints précédents</span>
              <b>{formatNumber(avgDelivered || 0, 1)} sp</b>
              <span className="dek">{avgCompletion}%</span>
            </div>
            {recommendedVelocity && (
              <div className="sp__row">
                <span>Vélocité recommandée</span>
                <b>{recommendedVelocity} sp</b>
                <span className="kicker">— suggéré</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
