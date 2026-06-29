import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { CHART_COLORS } from '@/config.js'

interface CycleTimeChartProps {
  labels: string[]
  avgValues: number[]
  medianValues?: number[]
  benchmarkAvg?: number
  benchmarkMedian?: number
}

export function CycleTimeChart({ labels, avgValues, medianValues, benchmarkAvg, benchmarkMedian }: CycleTimeChartProps) {
  const data = labels.map((label, i) => ({
    label,
    avg: avgValues[i] || 0,
    median: medianValues?.[i] || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
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
          unit="j"
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.paper,
            border: `1px solid ${CHART_COLORS.line}`,
            borderRadius: 6,
            fontSize: 12,
          }}
          formatter={(value) => [`${Number(value).toFixed(1)}j`]}
        />
        {benchmarkAvg && (
          <ReferenceLine y={benchmarkAvg} stroke={CHART_COLORS.amber} strokeDasharray="4 4" />
        )}
        {benchmarkMedian && (
          <ReferenceLine y={benchmarkMedian} stroke={CHART_COLORS.ink3} strokeDasharray="4 4" />
        )}
        <Line
          type="monotone"
          dataKey="avg"
          stroke={CHART_COLORS.amber}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_COLORS.amber }}
          name="Moyenne"
        />
        {medianValues && (
          <Line
            type="monotone"
            dataKey="median"
            stroke={CHART_COLORS.ochre}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: CHART_COLORS.ochre }}
            name="Médiane"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
