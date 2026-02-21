/**
 * Impact Dashboard (mini)
 * Optionality mini-app: before/after metrics, contributions, outcome summary.
 */
import { useState } from 'react'
import { BarChart3, Target, Plus } from 'lucide-react'

interface Metric {
  id: string
  name: string
  before: string
  after: string
  unit: string
}

export default function ImpactDashboardMini() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [name, setName] = useState('')
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const [unit, setUnit] = useState('')

  const addMetric = () => {
    if (!name.trim()) return
    setMetrics((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        before: before.trim(),
        after: after.trim(),
        unit: unit.trim() || '—',
      },
    ])
    setName('')
    setBefore('')
    setAfter('')
    setUnit('')
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-400" /> Impact dashboard
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Track before/after metrics and contributions.
      </p>
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Metric name"
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            placeholder="Before"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
          />
          <input
            type="text"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            placeholder="After"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
          />
        </div>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unit (e.g. %, ms, count)"
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
        />
        <button
          type="button"
          onClick={addMetric}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
        >
          <Plus className="w-4 h-4" /> Add metric
        </button>
      </div>
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-400 flex items-center gap-1">
          <Target className="w-3.5 h-3.5" /> Metrics
        </h4>
        {metrics.length === 0 ? (
          <p className="text-xs text-gray-500">Add a metric above to track impact.</p>
        ) : (
          metrics.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-800 border border-gray-600"
            >
              <span className="text-sm text-white">{m.name}</span>
              <span className="text-xs text-gray-400">
                {m.before || '—'} → {m.after || '—'} {m.unit}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
