import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'

// @ts-expect-error — JS service
import monteCarloService from '@/services/monteCarloService.js'
// @ts-expect-error — JS service
import { aggregateBySprint } from '@/services/csvParserV2.js'

export function SharedContributorsPage() {
  const csvData = useAppStore((s) => s.csvData)
  const csvLoaded = useAppStore((s) => s.csvLoaded)
  const selectedTeams = useAppStore((s) => s.selectedTeams)

  const contributors = useMemo(() => {
    if (!csvLoaded || !csvData?.tickets) return null

    try {
      // Filtrer par équipe(s) sélectionnée(s), comme le vanilla
      let tickets = csvData.tickets as any[]
      if (selectedTeams.length > 0) {
        tickets = tickets.filter((t: any) => selectedTeams.includes(t.team))
      }
      const sprintData = aggregateBySprint(tickets)
      const sprintNums = sprintData.map((s: any) => s.sprint).slice(-6)

      if (sprintNums.length < 2) return null

      const analysis = monteCarloService.analyzeForecast(tickets, sprintNums, {})
      return analysis.contributors
        ?.sort((a: any, b: any) => (b.throughput?.mean || 0) - (a.throughput?.mean || 0))
        || []
    } catch {
      return null
    }
  }, [csvLoaded, csvData, selectedTeams])

  if (!csvLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">upload_file</span>
        <h2 className="h-section mb-2">Aucune donnée</h2>
        <p className="dek">Importez vos CSV depuis la page Admin.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="cover">
        <div>
          <div className="eyebrow" style={{ color: '#667eea' }}>Page secrète</div>
          <h1 className="h-display">
            Star<em>Ac</em>
          </h1>
          <p className="lede">Classement des contributeurs sur les 6 derniers sprints</p>
        </div>
      </div>

      {contributors && contributors.length > 0 ? (
        <div className="section--editorial">
          <div className="section__head">
            <div className="section__title">
              <div className="section__num">★ — Leaderboard</div>
              <h2 className="h-section">Contributeurs</h2>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Contributeur</th>
                  <th>Sprints actifs</th>
                  <th>Moy. tickets</th>
                  <th>Moy. SP</th>
                  <th>Fiabilité</th>
                  <th>Équipe</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((c: any, i: number) => (
                  <tr key={c.name}>
                    <td className="mono font-medium">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="font-medium">{c.name}</td>
                    <td className="mono">{c.sprintCount}</td>
                    <td className="mono">{c.throughput?.mean?.toFixed(1) ?? '—'}</td>
                    <td className="mono">{c.storyPoints?.mean?.toFixed(1) ?? '—'}</td>
                    <td>
                      <Badge variant={
                        (c.reliability || 0) >= 0.8 ? 'default' :
                        (c.reliability || 0) >= 0.5 ? 'secondary' : 'destructive'
                      }>
                        {Math.round((c.reliability || 0) * 100)}%
                      </Badge>
                    </td>
                    <td>
                      {c.team && <Badge variant="outline">{c.team}</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats summary */}
          <div className="kpi-grid" style={{ marginTop: 24 }}>
            <div className="kpi kpi--feat">
              <div className="kpi__label">Contributeurs</div>
              <div className="kpi__num"><span className="tnum">{contributors.length}</span></div>
            </div>
            <div className="kpi">
              <div className="kpi__label">Moy. tickets/sprint/pers.</div>
              <div className="kpi__num">
                <span className="tnum">
                  {(contributors.reduce((s: number, c: any) => s + (c.throughput?.mean || 0), 0) / contributors.length).toFixed(1)}
                </span>
              </div>
            </div>
            <div className="kpi">
              <div className="kpi__label">Fiabilité moyenne</div>
              <div className="kpi__num">
                <span className="tnum">
                  {Math.round(contributors.reduce((s: number, c: any) => s + (c.reliability || 0), 0) / contributors.length * 100)}
                </span>
                <em>%</em>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="dek">Données insuffisantes pour le leaderboard.</p>
        </div>
      )}

      <div className="fineprint">
        *Page secrète — ↑↑↓↓ pour débloquer, ↓↓↑↑ pour masquer
      </div>
    </div>
  )
}
