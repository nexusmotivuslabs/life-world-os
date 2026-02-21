/**
 * Learning Rate Tracker
 * Optionality mini-app: log decisions, track accuracy, learning velocity.
 */
import { useState } from 'react'
import { BookOpen, TrendingUp, Check, X, Plus } from 'lucide-react'

interface DecisionLog {
  id: string
  decision: string
  outcome: 'correct' | 'incorrect' | 'pending'
  date: string
}

export default function LearningRateTracker() {
  const [decision, setDecision] = useState('')
  const [logs, setLogs] = useState<DecisionLog[]>([])
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all')

  const addLog = () => {
    if (!decision.trim()) return
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        decision: decision.trim(),
        outcome: 'pending' as const,
        date: new Date().toISOString().slice(0, 10),
      },
    ])
    setDecision('')
  }

  const setOutcome = (id: string, outcome: 'correct' | 'incorrect') => {
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, outcome } : l)))
  }

  const filtered = logs.filter(
    (l) => filter === 'all' || (filter === 'correct' && l.outcome === 'correct') || (filter === 'incorrect' && l.outcome === 'incorrect')
  )
  const resolved = logs.filter((l) => l.outcome !== 'pending')
  const correct = logs.filter((l) => l.outcome === 'correct').length
  const accuracy = resolved.length ? Math.round((correct / resolved.length) * 100) : 0

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-blue-400" /> Learning rate
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Log decisions and mark outcomes to track accuracy over time.
      </p>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addLog()}
          placeholder="Decision or prediction"
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
        />
        <button
          type="button"
          onClick={addLog}
          className="flex items-center justify-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {logs.length > 0 && (
        <div className="p-3 rounded-lg bg-gray-800 border border-gray-600 mb-3 flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Accuracy
          </span>
          <span className="text-lg font-bold text-green-400">{accuracy}%</span>
        </div>
      )}
      {logs.length > 1 && (
        <div className="flex gap-1 mb-2">
          {(['all', 'correct', 'incorrect'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-xs ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-500">
            {logs.length === 0 ? 'Add a decision above.' : 'No entries match filter.'}
          </p>
        ) : (
          filtered.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 border border-gray-600"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{l.decision}</p>
                <p className="text-xs text-gray-500">{l.date}</p>
              </div>
              {l.outcome === 'pending' ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setOutcome(l.id, 'correct')}
                    className="p-1 rounded text-green-400 hover:bg-green-400/20"
                    aria-label="Correct"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome(l.id, 'incorrect')}
                    className="p-1 rounded text-red-400 hover:bg-red-400/20"
                    aria-label="Incorrect"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span
                  className={`text-xs font-medium ${
                    l.outcome === 'correct' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {l.outcome === 'correct' ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
