import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { CHART_COLORS } from '@/config.js'

interface WipChartProps {
  labels: string[]
  values: number[]
  avgWip?: number
}

export function WipChart({ labels, values, avgWip }: WipChartProps) {
  const data = labels.map((label, i) => ({
    label,
    value: values[i] || 0,
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
          formatter={(value: number) => [`${value.toFixed(1)}`, 'WIP moyen']}
        />
        {avgWip && (
          <ReferenceLine
            y={avgWip}
            stroke={CHART_COLORS.ink3}
            strokeDasharray="4 4"
            label={{ value: `Moy. ${avgWip.toFixed(1)}`, position: 'right', fontSize: 10, fill: CHART_COLORS.ink3 }}
          />
        )}
        <Bar dataKey="value" fill={CHART_COLORS.plum} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
