import { useState } from 'react'
import type { ConstraintResult } from '../types/rie'
import { WarningLevelBadge, warningColor } from './WarningLevel'
import { TimeSeriesChart } from './TimeSeriesChart'
import { SignalBadge } from './SignalBadge'
import { StrategicThesis } from './StrategicThesis'

const LAYER_LABELS: Record<number, string> = {
  1: 'Constraint of Life · Physical',
  2: 'Constraint of Life · Biological',
  3: 'Constraint of Life · Economic',
  4: 'Constraint of Life · Informational',
  5: 'Constraint of Life · Social',
}

interface Props {
  constraint: ConstraintResult
}

export function ConstraintCard({ constraint }: Props) {
  const [activeMetricIdx, setActiveMetricIdx] = useState(0)
  const [section, setSection] = useState<'signals' | 'message' | 'thesis'>('signals')

  const activeMetric = constraint.metrics[activeMetricIdx]
  const levelColor = warningColor(constraint.warning_level)

  return (
    <div className="flex flex-col rounded-xl border border-gray-700/60 bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700/60 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              {LAYER_LABELS[constraint.layer] ?? `Layer ${constraint.layer}`}
            </span>
          </div>
          <h2 className={`text-xl font-bold tracking-tight mt-0.5 ${levelColor}`}>
            {constraint.name}
          </h2>
        </div>
        <WarningLevelBadge level={constraint.warning_level} size="sm" />
      </div>

      {/* Metric tabs (if multiple) */}
      {constraint.metrics.length > 1 && (
        <div className="flex border-b border-gray-700/40 bg-gray-800/40">
          {constraint.metrics.map((m, i) => (
            <button
              key={m.indicator}
              onClick={() => setActiveMetricIdx(i)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                i === activeMetricIdx
                  ? 'border-b-2 border-indigo-500 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* State — Time Series + latest value */}
      <div className="px-5 pt-4 pb-2">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-white tabular-nums">
              {activeMetric.latest_value !== null
                ? activeMetric.latest_value.toLocaleString('en-GB', { maximumFractionDigits: 2 })
                : '—'}
            </span>
            <span className="ml-1.5 text-xs text-gray-400">{activeMetric.units}</span>
          </div>
          <span className="text-xs text-gray-500">
            {activeMetric.last_updated ? `Year: ${activeMetric.last_updated}` : ''}
          </span>
        </div>

        <TimeSeriesChart
          data={activeMetric.series}
          units={activeMetric.units}
          warningLevel={constraint.warning_level}
          metricName={activeMetric.name}
        />

        <div className="mt-1 text-xs text-gray-500 truncate">
          Source: {activeMetric.source}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-0 border-y border-gray-700/40 bg-gray-800/30">
        {(['signals', 'message', 'thesis'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
              section === s
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {s === 'signals' ? 'Signals' : s === 'message' ? 'Structural' : 'Strategic'}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 px-5 py-4">
        {section === 'signals' && (
          <div className="space-y-1.5">
            {activeMetric.signals && activeMetric.signals.descriptions.length > 0 ? (
              activeMetric.signals.descriptions.map((d, i) => (
                <SignalBadge key={i} description={d} />
              ))
            ) : (
              <p className="text-xs text-gray-500">No signal data available.</p>
            )}
          </div>
        )}

        {section === 'message' && (
          <p className="text-sm leading-relaxed text-gray-300">
            {constraint.structural_message}
          </p>
        )}

        {section === 'thesis' && (
          <StrategicThesis constraint={constraint} />
        )}
      </div>
    </div>
  )
}
