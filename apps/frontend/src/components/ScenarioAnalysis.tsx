/**
 * ScenarioAnalysis Component
 * 
 * Analyzes financial scenarios based on expense ranges and provides
 * research-backed recommendations for achieving goals.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, BookOpen, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'
import { expenseApi, ExpenseCategoryType } from '../services/expenseApi'
import ExpenseRangeInput, { ExpenseRange } from './ExpenseRangeInput'
import { useToastStore } from '../store/useToastStore'
import { formatCurrencySimple } from '../utils/currency'

interface ScenarioResult {
  scenario: 'OPTIMISTIC' | 'MODERATE' | 'CONSERVATIVE'
  totalExpenses: { min: number; max: number; average: number }
  essentialExpenses: { min: number; max: number; average: number }
  monthlySurplus: { min: number; max: number; average: number }
  timeToGoal: { monthsMin: number; monthsMax: number; monthsAverage: number }
  recommendations: string[]
  researchBasedInsights: string[]
}

export default function ScenarioAnalysis() {
  const { addToast } = useToastStore()
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [expenseRanges, setExpenseRanges] = useState<ExpenseRange[]>([])
  const [goalType, setGoalType] = useState<'EMERGENCY_FUND' | 'DEBT_PAYOFF' | 'SAVINGS' | 'RETIREMENT'>('EMERGENCY_FUND')
  const [goalAmount, setGoalAmount] = useState('')
  const [timeHorizon, setTimeHorizon] = useState('6')
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleAnalyze = async () => {
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Income',
        message: 'Please enter a valid monthly income',
      })
      return
    }

    if (expenseRanges.length === 0 || expenseRanges.every(r => r.min === 0 && r.max === 0)) {
      addToast({
        type: 'error',
        title: 'No Expenses',
        message: 'Please enter at least one expense range',
      })
      return
    }

    try {
      setLoading(true)
      const response = await expenseApi.analyzeScenario({
        monthlyIncome: parseFloat(monthlyIncome),
        expenseRanges,
        goalType,
        goalAmount: goalAmount ? parseFloat(goalAmount) : undefined,
        timeHorizon: timeHorizon ? parseInt(timeHorizon) : undefined,
      })
      setScenarios(response.scenarios)
      setShowResults(true)
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to analyze scenario'
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'OPTIMISTIC':
        return 'text-green-400 border-green-500 bg-green-500/10'
      case 'MODERATE':
        return 'text-blue-400 border-blue-500 bg-blue-500/10'
      case 'CONSERVATIVE':
        return 'text-orange-400 border-orange-500 bg-orange-500/10'
      default:
        return 'text-gray-400 border-gray-500 bg-gray-500/10'
    }
  }

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case 'OPTIMISTIC':
        return TrendingUp
      case 'CONSERVATIVE':
        return TrendingDown
      default:
        return Target
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Scenario Analysis</h2>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Income</label>
              <input
                type="number"
                step="0.01"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="Enter your monthly income"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="EMERGENCY_FUND">Emergency Fund</option>
                <option value="DEBT_PAYOFF">Debt Payoff</option>
                <option value="SAVINGS">Savings Goal</option>
                <option value="RETIREMENT">Retirement</option>
              </select>
            </div>

            {goalType !== 'EMERGENCY_FUND' && (
              <div>
                <label className="block text-sm font-medium mb-2">Goal Amount (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Enter target amount"
                />
              </div>
            )}

            {goalType === 'EMERGENCY_FUND' && (
              <div>
                <label className="block text-sm font-medium mb-2">Months Coverage</label>
                <select
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months (recommended)</option>
                  <option value="9">9 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
            )}
          </div>

          {/* Expense Range Input */}
          {monthlyIncome && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Enter Expense Ranges</h3>
              <p className="text-sm text-gray-400 mb-4">
                Enter minimum and maximum amounts for each expense category to see different scenarios
              </p>
              <ExpenseRangeInput
                ranges={expenseRanges}
                onRangesChange={setExpenseRanges}
                monthlyIncome={parseFloat(monthlyIncome) || 0}
              />
            </div>
          )}

          {/* Analyze Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !monthlyIncome}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md font-medium flex items-center gap-2"
            >
              {loading ? 'Analyzing...' : 'Analyze Scenarios'}
              <Target className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Analysis Results</h3>
            <button
              onClick={() => setShowResults(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
            >
              Edit Inputs
            </button>
          </div>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => {
              const Icon = getScenarioIcon(scenario.scenario)
              const colorClass = getScenarioColor(scenario.scenario)

              return (
                <div
                  key={scenario.scenario}
                  className={`rounded-lg p-6 border-2 ${colorClass}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6" />
                    <h4 className="text-xl font-bold">{scenario.scenario}</h4>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-sm opacity-75 mb-1">Monthly Surplus</div>
                      <div className="text-2xl font-bold">
                        {formatCurrencySimple(scenario.monthlySurplus.average)}
                      </div>
                      <div className="text-xs opacity-60">
                        Range: {formatCurrencySimple(scenario.monthlySurplus.min)} - {formatCurrencySimple(scenario.monthlySurplus.max)}
                      </div>
                    </div>

                    {scenario.timeToGoal.monthsAverage > 0 && (
                      <div>
                        <div className="text-sm opacity-75 mb-1">Time to Goal</div>
                        <div className="text-xl font-semibold">
                          {scenario.timeToGoal.monthsAverage.toFixed(1)} months
                        </div>
                        <div className="text-xs opacity-60">
                          Range: {scenario.timeToGoal.monthsMin} - {scenario.timeToGoal.monthsMax} months
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm opacity-75 mb-1">Essential Expenses</div>
                      <div className="text-lg font-semibold">
                        {formatCurrencySimple(scenario.essentialExpenses.average)}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="border-t border-current/20 pt-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <Lightbulb className="w-4 h-4" />
                      Recommendations
                    </div>
                    {scenario.recommendations.map((rec, idx) => (
                      <div key={idx} className="text-sm opacity-90">{rec}</div>
                    ))}
                  </div>

                  {/* Research Insights */}
                  <div className="border-t border-current/20 pt-4 mt-4 space-y-2">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <BookOpen className="w-4 h-4" />
                      Research Insights
                    </div>
                    {scenario.researchBasedInsights.map((insight, idx) => (
                      <div key={idx} className="text-sm opacity-75">{insight}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

