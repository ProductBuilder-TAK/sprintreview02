import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS } from '@/config.js'

interface BugsChartProps {
  labels: string[]
  created: number[]
  closed: number[]
}

export function BugsChart({ labels, created, closed }: BugsChartProps) {
  const data = labels.map((label, i) => ({
    label,
    created: created[i] || 0,
    closed: closed[i] || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.line} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: CHART_COLORS.ink3 }}
          axisLine={{ stroke: CHART_COLORS.line }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_COLORS.ink3 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.paper,
            border: `1px solid ${CHART_COLORS.line}`,
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="created" name="Créés" fill={CHART_COLORS.rust} radius={[3, 3, 0, 0]} />
        <Bar dataKey="closed" name="Résolus" fill={CHART_COLORS.sage} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
