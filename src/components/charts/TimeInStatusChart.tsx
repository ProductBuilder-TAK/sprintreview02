import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CHART_COLORS } from '@/config.js'

const STATUS_COLORS = [
  CHART_COLORS.sage,
  CHART_COLORS.amber,
  CHART_COLORS.sky,
  CHART_COLORS.plum,
  CHART_COLORS.rust,
  CHART_COLORS.sage2,
  CHART_COLORS.ochre,
]

interface StatusData {
  name: string
  value: number
}

interface TimeInStatusChartProps {
  data: StatusData[]
  title?: string
}

export function TimeInStatusChart({ data, title }: TimeInStatusChartProps) {
  if (!data || data.length === 0) return null

  return (
    <div style={{ textAlign: 'center' }}>
      {title && <div className="eyebrow" style={{ marginBottom: 8 }}>{title}</div>}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${Number(value).toFixed(1)}j`, name]}
            contentStyle={{
              background: CHART_COLORS.paper,
              border: `1px solid ${CHART_COLORS.line}`,
              borderRadius: 6,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ========================================================================
 * Legend for Time in Status
 * ======================================================================== */
interface StatusLegendProps {
  items: StatusData[]
}

export function StatusLegend({ items }: StatusLegendProps) {
  return (
    <div className="legend">
      {items.map((item, i) => (
        <div key={item.name} className="legend__item">
          <span className="legend__sw" style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }} />
          {item.name}
        </div>
      ))}
    </div>
  )
}
