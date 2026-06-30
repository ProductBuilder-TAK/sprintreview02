import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ScenarioCard } from '@/components/ScenarioCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { ThroughputChart } from '@/components/charts/ThroughputChart'
import { DistributionChart } from '@/components/charts/DistributionChart'
import { Badge } from '@/components/ui/badge'

// @ts-expect-error — JS service
import forecastService from '@/services/forecastDataService.js'

export function ForecastPage() {
  const csvLoaded = useAppStore((s) => s.csvLoaded)
  const csvData = useAppStore((s) => s.csvData)
  const selectedSprint = useAppStore((s) => s.selectedSprint)
  const selectedTeams = useAppStore((s) => s.selectedTeams)

  const [metricType, setMetricType] = useState<'throughput' | 'storyPoints'>('throughput')

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
      })
    } catch (err) {
      console.error('[ForecastPage] Error:', err)
      return null
    }
  }, [csvLoaded, csvData, selectedSprint, selectedTeams])

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

      {/* Contributors table */}
      {contributors && contributors.length > 0 && (
        <div className="section--editorial">
          <div className="section__head">
            <div className="section__title">
              <span className="section__num">§ 04 — Contributeurs</span>
              <h2 className="h-section">Simulation individuelle</h2>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Contributeur</th>
                  <th>Sprints</th>
                  <th>Moy. tickets</th>
                  <th>Moy. SP</th>
                  <th>Fiabilité</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((c: any) => (
                  <tr key={c.name}>
                    <td className="font-medium">{c.name}</td>
                    <td className="mono">{c.sprintCount}</td>
                    <td className="mono">{c.throughput?.mean?.toFixed(1) ?? '—'}</td>
                    <td className="mono">{c.storyPoints?.mean?.toFixed(1) ?? '—'}</td>
                    <td>
                      <Badge variant={c.reliability >= 0.8 ? 'default' : 'secondary'}>
                        {Math.round((c.reliability || 0) * 100)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
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
