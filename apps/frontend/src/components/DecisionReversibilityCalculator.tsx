/**
 * Decision Reversibility Calculator
 * Optionality mini-app: reversibility score, reversal cost estimate, risk level.
 */
import { useState } from 'react'
import { RefreshCw, DollarSign, Clock, AlertTriangle } from 'lucide-react'

type ReversibilityLevel = 'high' | 'medium' | 'low'

export default function DecisionReversibilityCalculator() {
  const [decision, setDecision] = useState('')
  const [financialCost, setFinancialCost] = useState('')
  const [timeMonths, setTimeMonths] = useState('')
  const [relationshipImpact, setRelationshipImpact] = useState('low') // low | medium | high
  const [result, setResult] = useState<{
    score: number
    level: ReversibilityLevel
    costEstimate: string
    riskNote: string
  } | null>(null)

  const calculate = () => {
    const financial = parseFloat(financialCost) || 0
    const months = parseFloat(timeMonths) || 0
    const relWeight = { low: 0, medium: 25, high: 50 }[relationshipImpact]
    // Simple model: higher cost + time + relationship = lower reversibility
    const rawScore = 100 - Math.min(100, financial / 100 + months * 5 + relWeight)
    const score = Math.round(Math.max(0, rawScore))
    const level: ReversibilityLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
    const costEstimate =
      financial > 0 || months > 0
        ? `~$${financial.toLocaleString()} and ${months} month(s) to reverse`
        : 'Estimate reversal cost above for details.'
    const riskNote =
      level === 'low'
        ? 'Largely irreversible. Build mitigation buffers before committing.'
        : level === 'medium'
          ? 'Reversible at meaningful cost. Consider buffers.'
          : 'Reversible. Still document and plan for clarity.'
    setResult({ score, level, costEstimate, riskNote })
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-white mb-3">Decision Reversibility</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Decision (brief)</label>
          <input
            type="text"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="e.g. Change job, relocate, big purchase"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <DollarSign className="w-3 h-3" /> $ to reverse
            </label>
            <input
              type="number"
              min="0"
              value={financialCost}
              onChange={(e) => setFinancialCost(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Clock className="w-3 h-3" /> Months
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={timeMonths}
              onChange={(e) => setTimeMonths(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Relationship impact if reversed</label>
          <select
            value={relationshipImpact}
            onChange={(e) => setRelationshipImpact(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="button"
          onClick={calculate}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Calculate
        </button>
      </div>
      {result && (
        <div className="mt-4 p-3 rounded-lg bg-gray-800 border border-gray-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Reversibility score</span>
            <span
              className={`text-lg font-bold ${
                result.level === 'high'
                  ? 'text-green-400'
                  : result.level === 'medium'
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}
            >
              {result.score}
            </span>
          </div>
          <p className="text-xs text-gray-400">{result.costEstimate}</p>
          <div className="flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{result.riskNote}</span>
          </div>
        </div>
      )}
    </div>
  )
}
