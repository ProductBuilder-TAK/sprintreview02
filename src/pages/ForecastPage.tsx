import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ScenarioCard } from '@/components/ScenarioCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { ThroughputChart } from '@/components/charts/ThroughputChart'
import { DistributionChart } from '@/components/charts/DistributionChart'

// @ts-expect-error — JS service
import forecastService from '@/services/forecastDataService.js'

// Palette des contributeurs (identique au vanilla)
const CONTRIBUTOR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
]

export function ForecastPage() {
  const csvLoaded = useAppStore((s) => s.csvLoaded)
  const csvData = useAppStore((s) => s.csvData)
  const selectedSprint = useAppStore((s) => s.selectedSprint)
  const selectedTeams = useAppStore((s) => s.selectedTeams)
  const unlockedSecrets = useAppStore((s) => s.unlockedSecrets)

  const [metricType, setMetricType] = useState<'throughput' | 'storyPoints'>('throughput')
  const [excludedContributors, setExcludedContributors] = useState<string[]>([])

  const toggleAbsence = (name: string) => {
    setExcludedContributors((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }
  const clearAbsences = () => setExcludedContributors([])

  // Compute forecast data
  const forecastData = useMemo(() => {
    if (!csvLoaded || !csvData?.tickets) return null

    try {
      // Filtrer par équipe(s) sélectionnée(s) en Review, comme le vanilla
      // (qui réinjecte un csvData filtré). Sans sélection → toutes les équipes.
      let tickets = csvData.tickets as { team?: string }[]
      if (selectedTeams.length > 0) {
        tickets = tickets.filter((t) => selectedTeams.includes(t.team ?? ''))
      }
      const reviewSprintNum = selectedSprint

      return forecastService.prepareForecastData(tickets, {
        reviewSprint: reviewSprintNum,
        excludedContributors,
      })
    } catch (err) {
      console.error('[ForecastPage] Error:', err)
      return null
    }
  }, [csvLoaded, csvData, selectedSprint, selectedTeams, excludedContributors])

  if (!csvLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">upload_file</span>
        <h2 className="h-section mb-2">Aucune donnée</h2>
        <p className="dek">Importez vos CSV depuis la page Admin.</p>
      </div>
    )
  }

  if (!forecastData || !forecastData.isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">analytics</span>
        <h2 className="h-section mb-2">Forecast indisponible</h2>
        <p className="dek">{forecastData?.error || 'Données insuffisantes pour la simulation Monte Carlo.'}</p>
      </div>
    )
  }

  const { simulation, scenarios, charts, teamMetrics, nextSprint, contributors } = forecastData
  const hasStoryPoints = forecastData.validation?.hasStoryPoints ?? false
  const showIndividual = unlockedSecrets.has('individual')
  const dist = charts?.distribution?.[metricType]
  const velocityChart = metricType === 'storyPoints' ? charts?.teamStoryPoints : charts?.teamVelocity

  return (
    <div>
      {/* Cover */}
      <div className="cover">
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>§ 00 — Projection · {forecastData.simulation?.iterations?.toLocaleString() || '10 000'} simulations</div>
          <h1 className="h-display">Ce que <em>Sprint {nextSprint}</em> pourrait livrer.</h1>
          <p className="lede" style={{ marginTop: 18 }}>
            Approche Monte Carlo : pour chaque membre, on tire au hasard une performance passée, puis on lit la distribution.
          </p>
          {forecastData.sprintNumbers?.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pill pill--ghost">Basé sur Sprints {forecastData.sprintNumbers[0]} → {forecastData.sprintNumbers[forecastData.sprintNumbers.length - 1]}</span>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="cover__sprintno"><sup>S</sup>{nextSprint}</div>
        </div>
      </div>

      {/* Scenarios */}
      <div className="section--editorial">
        <div className="section__head">
          <div className="section__title">
            <span className="section__num">§ 01 — Trois scénarios</span>
            <h2 className="h-section">Pessimiste · Réaliste · Optimiste</h2>
          </div>
          <div className="toggle">
            <button
              aria-pressed={metricType === 'throughput' ? 'true' : 'false'}
              onClick={() => setMetricType('throughput')}
            >
              Tickets
            </button>
            <button
              aria-pressed={metricType === 'storyPoints' ? 'true' : 'false'}
              onClick={() => setMetricType('storyPoints')}
            >
              SP
            </button>
          </div>
        </div>

        {simulation && (
          <div className="scenarios">
            <ScenarioCard
              name="Pessimiste"
              percentile="P15"
              value={simulation[metricType]?.p15 ?? '—'}
              sub={metricType === 'throughput'
                ? `<b>${simulation[metricType]?.p15}</b> tickets minimum`
                : `<b>${simulation[metricType]?.p15}</b> SP minimum`}
              description="Dans le pire des cas raisonnable, l'équipe livre au moins ce volume."
              variant="p15"
            />
            <ScenarioCard
              name="Réaliste"
              percentile="P50"
              value={simulation[metricType]?.p50 ?? '—'}
              sub={metricType === 'throughput'
                ? `<b>${simulation[metricType]?.p50}</b> tickets — scénario le plus probable`
                : `<b>${simulation[metricType]?.p50}</b> SP — scénario le plus probable`}
              description="1 chance sur 2 de livrer au moins ce volume. Base pour les engagements."
              variant="p50"
            />
            <ScenarioCard
              name="Optimiste"
              percentile="P85"
              value={simulation[metricType]?.p85 ?? '—'}
              sub={metricType === 'throughput'
                ? `<b>${simulation[metricType]?.p85}</b> tickets dans le meilleur des cas`
                : `<b>${simulation[metricType]?.p85}</b> SP dans le meilleur des cas`}
              description="Si tout se passe bien, l'équipe pourrait livrer ce volume."
              variant="p85"
            />
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="section--editorial">
        <div className="section__head">
          <div className="section__title">
            <span className="section__num">§ 02 — Distribution</span>
            <h2 className="h-section">Probabilités de livraison</h2>
          </div>
        </div>
        <div className="grid-2">
          {/* Velocity Bar Chart */}
          {velocityChart && (
            <ChartCard
              title={metricType === 'storyPoints' ? 'Story Points' : 'Throughput'}
              subtitle={`${metricType === 'storyPoints' ? 'SP' : 'Tickets'} par sprint — moyenne : ${
                metricType === 'storyPoints'
                  ? teamMetrics?.storyPoints?.mean?.toFixed(1)
                  : teamMetrics?.throughput?.mean?.toFixed(1)
              }`}
            >
              <ThroughputChart
                labels={velocityChart.labels || []}
                values={velocityChart.datasets?.[0]?.data || []}
                benchmark={velocityChart.benchmark}
              />
            </ChartCard>
          )}

          {/* Distribution */}
          {dist && (
            <ChartCard
              title="Distribution Monte Carlo"
              subtitle={`Histogramme des résultats de simulation (${metricType === 'storyPoints' ? 'SP' : 'tickets'})`}
              legend={
                <div className="legend">
                  <div className="legend__item"><span className="legend__sw" style={{ background: 'var(--color-rust)' }} />P15</div>
                  <div className="legend__item"><span className="legend__sw" style={{ background: 'var(--color-ink)' }} />P50</div>
                  <div className="legend__item"><span className="legend__sw" style={{ background: 'var(--color-sage)' }} />P85</div>
                </div>
              }
            >
              <DistributionChart
                labels={dist.labels}
                data={dist.data}
                percentiles={dist.percentiles}
              />
            </ChartCard>
          )}
        </div>
      </div>

      {/* Absences — section secrète (Konami: → → ← ←) */}
      {showIndividual && contributors && contributors.length > 0 && (
        <div className="section--editorial">
          <div className="section__head">
            <div className="section__title">
              <span className="section__num">§ 03 — Absences</span>
              <h2 className="h-section">Simuler des absences</h2>
            </div>
            <span className="dek section__deck">Cochez les contributeurs absents pour recalculer.</span>
          </div>
          <div className="absence-selector">
            <div className="absence-selector__list">
              {contributors.map((c: any) => (
                <label className="absence-selector__item" key={c.name}>
                  <input
                    type="checkbox"
                    checked={excludedContributors.includes(c.name)}
                    onChange={() => toggleAbsence(c.name)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            {excludedContributors.length > 0 && (
              <div className="absence-selector__summary">
                <strong>{excludedContributors.length}</strong> contributeur(s) exclu(s)
                <button className="btn btn--link" onClick={clearAbsences}>Réinitialiser</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contributors table — section secrète (Konami: → → ← ←) */}
      {showIndividual && contributors && contributors.length > 0 && (
        <div className="section--editorial">
          <div className="section__head">
            <div className="section__title">
              <span className="section__num">§ 04 — Contributeurs</span>
              <h2 className="h-section">Simulation individuelle</h2>
            </div>
            {forecastData.sprintNumbers?.length > 0 && (
              <span className="dek section__deck">
                Basée sur les Sprints {forecastData.sprintNumbers[0]} → {forecastData.sprintNumbers[forecastData.sprintNumbers.length - 1]}
              </span>
            )}
          </div>
          <div className="contributors-table-wrapper">
            <table className="contributors-table contributors-table--scenarios">
              <thead>
                <tr>
                  <th rowSpan={2}>Contributeur</th>
                  <th colSpan={3} className="th-group">Tickets</th>
                  {hasStoryPoints && <th colSpan={3} className="th-group">Story Points</th>}
                  <th rowSpan={2}>Fiabilité</th>
                </tr>
                <tr>
                  <th className="th-scenario th-scenario--warning">Pessimiste</th>
                  <th className="th-scenario th-scenario--primary">Réaliste</th>
                  <th className="th-scenario th-scenario--success">Optimiste</th>
                  {hasStoryPoints && (
                    <>
                      <th className="th-scenario th-scenario--warning">Pessimiste</th>
                      <th className="th-scenario th-scenario--primary">Réaliste</th>
                      <th className="th-scenario th-scenario--success">Optimiste</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {contributors.map((c: any, idx: number) => (
                  <tr key={c.name} className={excludedContributors.includes(c.name) ? 'excluded' : ''}>
                    <td className="contributor-cell">
                      <span className="contributor-color" style={{ backgroundColor: CONTRIBUTOR_COLORS[idx % CONTRIBUTOR_COLORS.length] }} />
                      <span className="contributor-name">{c.name}</span>
                      <span className="contributor-sprints">{c.sprintsActive}/{c.sprintsAnalyzed} sprints</span>
                    </td>
                    <td className="scenario-cell scenario-cell--warning">{c.throughput.p15}</td>
                    <td className="scenario-cell scenario-cell--primary"><strong>{c.throughput.p50}</strong></td>
                    <td className="scenario-cell scenario-cell--success">{c.throughput.p85}</td>
                    {hasStoryPoints && (
                      <>
                        <td className="scenario-cell scenario-cell--warning">{c.storyPoints.p15}</td>
                        <td className="scenario-cell scenario-cell--primary"><strong>{c.storyPoints.p50}</strong></td>
                        <td className="scenario-cell scenario-cell--success">{c.storyPoints.p85}</td>
                      </>
                    )}
                    <td className="fiability-cell">
                      <span className={`badge badge--${c.isReliable ? 'success' : 'warning'}`}>
                        {c.isReliable ? 'Fiable' : 'Limité'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>ÉQUIPE</strong></td>
                  <td className="scenario-cell scenario-cell--warning">{simulation.throughput.p15}</td>
                  <td className="scenario-cell scenario-cell--primary"><strong>{simulation.throughput.p50}</strong></td>
                  <td className="scenario-cell scenario-cell--success">{simulation.throughput.p85}</td>
                  {hasStoryPoints && (
                    <>
                      <td className="scenario-cell scenario-cell--warning">{simulation.storyPoints.p15}</td>
                      <td className="scenario-cell scenario-cell--primary"><strong>{simulation.storyPoints.p50}</strong></td>
                      <td className="scenario-cell scenario-cell--success">{simulation.storyPoints.p85}</td>
                    </>
                  )}
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <div className="fineprint">
        *Projection basée sur la simulation Monte Carlo (10 000 itérations).
        Les résultats sont des estimations probabilistes, pas des garanties.
      </div>
    </div>
  )
}
