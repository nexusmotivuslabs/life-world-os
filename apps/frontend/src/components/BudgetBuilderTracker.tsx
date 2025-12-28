/**
 * BudgetBuilderTracker Component
 * 
 * Budget creation and spending tracking component.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, AlertCircle } from 'lucide-react'
import { expenseApi, CategoryExpense } from '../services/expenseApi'
import { useToastStore } from '../store/useToastStore'
import ExpenseBreakdown from './ExpenseBreakdown'
import { formatCurrencySimple } from '../utils/currency'
import { logger } from '../lib/logger'

export default function BudgetBuilderTracker() {
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(true)
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [budgetExpenses, setBudgetExpenses] = useState<CategoryExpense[]>([])
  const [actualExpenses, setActualExpenses] = useState<CategoryExpense[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadBudget()
  }, [currentMonth, currentYear])

  const loadBudget = async () => {
    try {
      setLoading(true)
      // TODO: Get actual userId from auth
      const userId = 'demo-user-id'
      const breakdown = await expenseApi.getBreakdown(userId, currentMonth, currentYear)
      
      if (breakdown.expense) {
        setMonthlyIncome(breakdown.expense.monthlyIncome.toString())
        setBudgetExpenses(breakdown.expense.expenses)
        setActualExpenses(breakdown.expense.expenses) // In a real app, these would be separate
      }
    } catch (error) {
      logger.error('Error loading budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBudget = async () => {
    try {
      if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
        addToast({
          type: 'error',
          title: 'Invalid Income',
          message: 'Please enter a valid monthly income',
        })
        return
      }

      const userId = 'demo-user-id' // TODO: Get from auth
      await expenseApi.createOrUpdate({
        userId,
        monthlyIncome: parseFloat(monthlyIncome),
        expenses: budgetExpenses,
        month: currentMonth,
        year: currentYear,
      })

      addToast({
        type: 'success',
        title: 'Budget Saved!',
        message: 'Your budget has been saved successfully',
      })
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save budget'
      addToast({
        type: 'error',
        title: 'Failed to Save Budget',
        message: errorMessage,
      })
    }
  }

  const calculateBudgetTotal = () => {
    return budgetExpenses.reduce((sum, e) => sum + e.amount, 0)
  }

  const calculateActualTotal = () => {
    return actualExpenses.reduce((sum, e) => sum + e.amount, 0)
  }

  // Reserved for future use
  // const getCategoryDifference = (category: ExpenseCategoryType) => {
  //   const budget = budgetExpenses.find(e => e.category === category)?.amount || 0
  //   const actual = actualExpenses.find(e => e.category === category)?.amount || 0
  //   return actual - budget
  // }

  const getOverBudgetCategories = () => {
    return budgetExpenses.filter(budgetExp => {
      const actual = actualExpenses.find(a => a.category === budgetExp.category)?.amount || 0
      return actual > budgetExp.amount
    })
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">Loading budget tracker...</div>
      </div>
    )
  }

  const budgetTotal = calculateBudgetTotal()
  const actualTotal = calculateActualTotal()
  const difference = actualTotal - budgetTotal
  const overBudgetCategories = getOverBudgetCategories()
  const income = parseFloat(monthlyIncome) || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Budget Builder & Tracker</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Income Input */}
      <div className="mb-6">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Budget Total</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrencySimple(budgetTotal)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Actual Spending</div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatCurrencySimple(actualTotal)}
          </div>
        </div>
        <div className={`bg-gray-700/50 rounded-lg p-4 ${difference < 0 ? 'border-2 border-green-500' : difference > 0 ? 'border-2 border-red-500' : ''}`}>
          <div className="text-sm text-gray-400 mb-1">Difference</div>
              <div className={`text-2xl font-bold ${difference < 0 ? 'text-green-400' : difference > 0 ? 'text-red-400' : 'text-white'}`}>
                {difference >= 0 ? '+' : ''}{formatCurrencySimple(Math.abs(difference))}
              </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Remaining</div>
          <div className={`text-2xl font-bold ${income - actualTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrencySimple(income - actualTotal)}
          </div>
        </div>
      </div>

      {/* Over Budget Alert */}
      {overBudgetCategories.length > 0 && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-400 mb-1">Over Budget Categories</div>
            <div className="text-sm text-gray-300">
              You're over budget in {overBudgetCategories.length} categor{overBudgetCategories.length === 1 ? 'y' : 'ies'}:
              {overBudgetCategories.map((exp, idx) => (
                <span key={idx} className="ml-2 font-medium">{exp.category}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget Builder */}
      {income > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Set Your Budget</h3>
          <ExpenseBreakdown
            monthlyIncome={income}
            expenses={budgetExpenses}
            onExpensesChange={setBudgetExpenses}
            showSuggestions={true}
            readOnly={false}
          />
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveBudget}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
        >
          Save Budget
        </button>
      </div>
    </motion.div>
  )
}

