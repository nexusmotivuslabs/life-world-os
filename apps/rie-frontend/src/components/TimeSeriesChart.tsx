import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DataPoint, WarningLevel } from '../types/rie'
import { warningStrokeColor } from './WarningLevel'

interface Props {
  data: DataPoint[]
  units: string
  warningLevel: WarningLevel
  metricName: string
}

function formatValue(value: number): string {
  if (value > 1000) return value.toLocaleString('en-GB', { maximumFractionDigits: 0 })
  if (value > 100) return value.toFixed(1)
  return value.toFixed(2)
}

export function TimeSeriesChart({ data, units, warningLevel, metricName }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded bg-gray-800/40 text-sm text-gray-500">
        No data available
      </div>
    )
  }

  const color = warningStrokeColor(warningLevel)

  const ma = data.length >= 4
    ? data.map((_, i) => {
        if (i < 3) return null
        const window = data.slice(i - 3, i + 1)
        return window.reduce((s, p) => s + p.value, 0) / window.length
      })
    : []

  const chartData = data.map((d, i) => ({
    year: d.year,
    value: d.value,
    ma: ma[i] ?? null,
  }))

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
          width={48}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#e5e7eb' }}
          formatter={(value: number) => [`${formatValue(value)} ${units}`, metricName]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
        {ma.some((v) => v !== null) && (
          <Line
            type="monotone"
            dataKey="ma"
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
            name="4yr MA"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
