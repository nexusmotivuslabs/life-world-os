/**
 * CashFlowAnalyzer Component
 * 
 * Cash flow analysis with income vs expenses tracking and trend visualization.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, ArrowUpRight } from 'lucide-react'
import { expenseApi } from '../services/expenseApi'
import { useToastStore } from '../store/useToastStore'
import { formatCurrencySimple } from '../utils/currency'
import { logger } from '../lib/logger'

interface MonthlyData {
  month: number
  year: number
  income: number
  expenses: number
  netCashFlow: number
}

export default function CashFlowAnalyzer() {
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  // Reserved for future filtering feature
  // const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadCashFlowData()
  }, [])

  const loadCashFlowData = async () => {
    try {
      setLoading(true)
      // TODO: Get actual userId from auth
      const userId = 'demo-user-id'
      
      // Load data for last 6 months
      const data: MonthlyData[] = []
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        
        try {
          const breakdown = await expenseApi.getBreakdown(userId, month, year)
          if (breakdown.expense) {
            data.push({
              month,
              year,
              income: breakdown.expense.monthlyIncome,
              expenses: breakdown.expense.totalExpenses,
              netCashFlow: breakdown.expense.netCashFlow,
            })
          }
        } catch (error) {
          // Skip months without data
          logger.log(`No data for ${month}/${year}`)
        }
      }
      
      setMonthlyData(data)
    } catch (error) {
      logger.error('Error loading cash flow data:', error)
      addToast({
        type: 'error',
        title: 'Failed to Load Data',
        message: 'Could not load cash flow data',
      })
    } finally {
      setLoading(false)
    }
  }

  const getAverageCashFlow = () => {
    if (monthlyData.length === 0) return 0
    const sum = monthlyData.reduce((acc, d) => acc + d.netCashFlow, 0)
    return sum / monthlyData.length
  }

  const getTrend = () => {
    if (monthlyData.length < 2) return 0
    const recent = monthlyData.slice(-3)
    const earlier = monthlyData.slice(0, 3)
    const recentAvg = recent.reduce((acc, d) => acc + d.netCashFlow, 0) / recent.length
    const earlierAvg = earlier.reduce((acc, d) => acc + d.netCashFlow, 0) / earlier.length
    return recentAvg - earlierAvg
  }

  const forecastNextMonth = () => {
    if (monthlyData.length < 2) return null
    const recent = monthlyData.slice(-3)
    const avgNetFlow = recent.reduce((acc, d) => acc + d.netCashFlow, 0) / recent.length
    const lastMonth = monthlyData[monthlyData.length - 1]
    return {
      projectedNetFlow: avgNetFlow,
      projectedExpenses: lastMonth.expenses * 1.02, // Assume 2% growth
      projectedIncome: lastMonth.income,
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">Loading cash flow analyzer...</div>
      </div>
    )
  }

  const averageCashFlow = getAverageCashFlow()
  const trend = getTrend()
  const forecast = forecastNextMonth()
  const currentData = monthlyData[monthlyData.length - 1]
  const maxValue = Math.max(
    ...monthlyData.map(d => Math.max(d.income, d.expenses)),
    1000
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Cash Flow Analyzer</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Average Cash Flow</div>
          <div className={`text-2xl font-bold ${averageCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrencySimple(averageCashFlow)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Current Trend</div>
          <div className={`flex items-center gap-2 text-2xl font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            {trend >= 0 ? '+' : ''}{formatCurrencySimple(trend)}
          </div>
          <div className="text-xs text-gray-500 mt-1">vs previous period</div>
        </div>
        {currentData && (
          <>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Last Month Income</div>
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrencySimple(currentData.income)}
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Last Month Expenses</div>
              <div className="text-2xl font-bold text-yellow-400">
                {formatCurrencySimple(currentData.expenses)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Trend Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">6-Month Cash Flow Trend</h3>
        <div className="bg-gray-700/30 rounded-lg p-6">
          <div className="flex items-end justify-between h-64 gap-2">
            {monthlyData.map((data, idx) => {
              const incomeHeight = (data.income / maxValue) * 100
              const expenseHeight = (data.expenses / maxValue) * 100
              const netHeight = Math.abs((data.netCashFlow / maxValue) * 100)
              const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'short' })
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full h-full flex items-end justify-center gap-1">
                    {/* Income bar */}
                    <div
                      className="w-1/2 bg-blue-500 rounded-t"
                      style={{ height: `${incomeHeight}%` }}
                      title={`Income: ${formatCurrencySimple(data.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      className="w-1/2 bg-red-500 rounded-t"
                      style={{ height: `${expenseHeight}%`}}
                      title={`Expenses: ${formatCurrencySimple(data.expenses)}`}
                    />
                    {/* Net cash flow indicator */}
                    {data.netCashFlow !== 0 && (
                      <div
                        className={`absolute ${data.netCashFlow >= 0 ? 'bottom-0' : 'top-0'} left-1/2 transform -translate-x-1/2 w-1 bg-${data.netCashFlow >= 0 ? 'green' : 'orange'}-500`}
                        style={{ height: `${Math.min(netHeight, 100)}%` }}
                        title={`Net: ${formatCurrencySimple(data.netCashFlow)}`}
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    <div>{monthName}</div>
                    <div className={`text-xs ${data.netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrencySimple(data.netCashFlow, 0)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Net Positive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {forecast && (
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            Next Month Forecast
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Projected Income</div>
              <div className="text-lg font-semibold text-white">
                {formatCurrencySimple(forecast.projectedIncome)}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Projected Expenses</div>
              <div className="text-lg font-semibold text-yellow-400">
                {formatCurrencySimple(forecast.projectedExpenses)}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Projected Net Flow</div>
              <div className={`text-lg font-semibold ${forecast.projectedNetFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrencySimple(forecast.projectedNetFlow)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            * Forecast based on average of last 3 months with 2% expense growth assumption
          </p>
        </div>
      )}

      {/* Recommendations */}
      {monthlyData.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
          {averageCashFlow < 0 && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-400 mb-1">Negative Average Cash Flow</div>
                <div className="text-sm text-gray-300">
                  Your expenses exceed your income on average. Consider reducing expenses or finding additional income sources.
                </div>
              </div>
            </div>
          )}
          {trend < 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3 flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-400 mb-1">Declining Trend</div>
                <div className="text-sm text-gray-300">
                  Your cash flow is trending downward. Review your spending habits and identify areas for improvement.
                </div>
              </div>
            </div>
          )}
          {averageCashFlow >= 0 && trend >= 0 && (
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-green-400 mb-1">Healthy Cash Flow</div>
                <div className="text-sm text-gray-300">
                  Great job! Your cash flow is positive and improving. Consider investing the surplus.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

