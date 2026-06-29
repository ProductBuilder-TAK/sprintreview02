import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'
import { CHART_COLORS } from '@/config.js'

interface DistributionChartProps {
  labels: number[]
  data: number[]
  percentiles: {
    p15: number
    p50: number
    p85: number
  }
}

export function DistributionChart({ labels, data, percentiles }: DistributionChartProps) {
  const chartData = labels.map((label, i) => ({
    value: label,
    percentage: data[i] || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 5, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.line} vertical={false} />
        <XAxis
          dataKey="value"
          tick={{ fontSize: 10, fill: CHART_COLORS.ink3 }}
          axisLine={{ stroke: CHART_COLORS.line }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: CHART_COLORS.ink3 }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.paper,
            border: `1px solid ${CHART_COLORS.line}`,
            borderRadius: 6,
            fontSize: 12,
          }}
          formatter={(value) => [`${Number(value).toFixed(1)}%`]}
        />
        <ReferenceLine x={percentiles.p15} stroke={CHART_COLORS.rust} strokeWidth={2} label={{ value: 'P15', position: 'top', fontSize: 10, fill: CHART_COLORS.rust }} />
        <ReferenceLine x={percentiles.p50} stroke={CHART_COLORS.ink} strokeWidth={2} label={{ value: 'P50', position: 'top', fontSize: 10, fill: CHART_COLORS.ink }} />
        <ReferenceLine x={percentiles.p85} stroke={CHART_COLORS.sage} strokeWidth={2} label={{ value: 'P85', position: 'top', fontSize: 10, fill: CHART_COLORS.sage }} />
        <Bar dataKey="percentage" radius={[2, 2, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.value <= percentiles.p15 ? CHART_COLORS.rustSoft
                  : entry.value >= percentiles.p85 ? CHART_COLORS.sageSoft
                  : CHART_COLORS.amberSoft
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
