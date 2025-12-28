/**
 * ExpenseBreakdown Component
 * 
 * Component for inputting and displaying monthly expense breakdown by category.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { expenseApi, ExpenseCategoryType, CategoryExpense } from '../services/expenseApi'
import { useToastStore } from '../store/useToastStore'
import { formatCurrencySimple } from '../utils/currency'

const CATEGORY_INFO: Record<ExpenseCategoryType, { name: string; icon: string; description: string; isEssential: boolean; recommendedPercentage?: number }> = {
  [ExpenseCategoryType.HOUSING]: { name: 'Housing', icon: '🏠', description: 'Rent, mortgage, property taxes, maintenance, HOA fees', isEssential: true, recommendedPercentage: 30 },
  [ExpenseCategoryType.FOOD]: { name: 'Food', icon: '🍔', description: 'Groceries, dining out, takeout, snacks', isEssential: true, recommendedPercentage: 10 },
  [ExpenseCategoryType.TRANSPORTATION]: { name: 'Transportation', icon: '🚗', description: 'Car payments, gas, public transit, parking, maintenance', isEssential: true, recommendedPercentage: 15 },
  [ExpenseCategoryType.UTILITIES]: { name: 'Utilities', icon: '💡', description: 'Electric, water, gas, internet, phone, trash', isEssential: true, recommendedPercentage: 5 },
  [ExpenseCategoryType.INSURANCE]: { name: 'Insurance', icon: '🛡️', description: 'Health, life, disability, auto, renters/homeowners insurance', isEssential: true, recommendedPercentage: 10 },
  [ExpenseCategoryType.HEALTHCARE]: { name: 'Healthcare', icon: '🏥', description: 'Medical bills, prescriptions, doctor visits, dental, vision', isEssential: true, recommendedPercentage: 5 },
  [ExpenseCategoryType.DEBT_PAYMENTS]: { name: 'Debt Payments', icon: '💳', description: 'Credit cards, student loans, personal loans, other debts', isEssential: true, recommendedPercentage: 20 },
  [ExpenseCategoryType.ENTERTAINMENT]: { name: 'Entertainment', icon: '🎬', description: 'Streaming services, hobbies, games, events, subscriptions', isEssential: false, recommendedPercentage: 5 },
  [ExpenseCategoryType.PERSONAL_CARE]: { name: 'Personal Care', icon: '💇', description: 'Haircuts, toiletries, clothing, gym memberships', isEssential: false, recommendedPercentage: 5 },
  [ExpenseCategoryType.EDUCATION]: { name: 'Education', icon: '📚', description: 'Tuition, books, courses, training, professional development', isEssential: false, recommendedPercentage: 5 },
  [ExpenseCategoryType.SAVINGS_INVESTMENTS]: { name: 'Savings & Investments', icon: '💰', description: 'Emergency fund contributions, retirement savings, investments', isEssential: false, recommendedPercentage: 20 },
  [ExpenseCategoryType.MISCELLANEOUS]: { name: 'Miscellaneous', icon: '📦', description: 'Other expenses that don\'t fit into other categories', isEssential: false },
}

interface ExpenseBreakdownProps {
  monthlyIncome: number
  expenses: CategoryExpense[]
  onExpensesChange: (expenses: CategoryExpense[]) => void
  onCalculateTotal?: (total: number) => void
  showSuggestions?: boolean
  readOnly?: boolean
}

export default function ExpenseBreakdown({
  monthlyIncome,
  expenses,
  onExpensesChange,
  onCalculateTotal,
  showSuggestions = true,
  readOnly = false,
}: ExpenseBreakdownProps) {
  // const { addToast } = useToastStore() // Reserved for future use
  const [suggestions, setSuggestions] = useState<any[]>([])
  // const [loadingSuggestions, setLoadingSuggestions] = useState(false) // Reserved for future use
  const [expandedCategories, setExpandedCategories] = useState<Set<ExpenseCategoryType>>(new Set())

  useEffect(() => {
    if (showSuggestions && monthlyIncome > 0) {
      loadSuggestions()
    }
  }, [monthlyIncome, expenses, showSuggestions])

  const loadSuggestions = async () => {
    try {
      // setLoadingSuggestions(true) // Reserved for future use
      const data = await expenseApi.getSuggestions(monthlyIncome, expenses)
      setSuggestions(data.suggestions)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      // setLoadingSuggestions(false) // Reserved for future use
    }
  }

  const updateExpense = (category: ExpenseCategoryType, amount: number, notes?: string) => {
    const updated = expenses.filter(e => e.category !== category)
    if (amount > 0) {
      updated.push({ category, amount, notes })
    }
    onExpensesChange(updated)
    
    const total = updated.reduce((sum, e) => sum + e.amount, 0)
    if (onCalculateTotal) {
      onCalculateTotal(total)
    }
  }

  const getExpense = (category: ExpenseCategoryType): number => {
    return expenses.find(e => e.category === category)?.amount || 0
  }

  const getNotes = (category: ExpenseCategoryType): string | undefined => {
    return expenses.find(e => e.category === category)?.notes
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const essentialTotal = expenses
    .filter(e => CATEGORY_INFO[e.category]?.isEssential)
    .reduce((sum, e) => sum + e.amount, 0)
  // const nonEssentialTotal = totalExpenses - essentialTotal // Reserved for future use
  const netCashFlow = monthlyIncome - totalExpenses
  const expensePercentage = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0

  const toggleCategory = (category: ExpenseCategoryType) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getSuggestion = (category: ExpenseCategoryType) => {
    return suggestions.find(s => s.category === category)
  }

  const allCategories = Object.values(ExpenseCategoryType)
  const essentialCategories = allCategories.filter(cat => CATEGORY_INFO[cat].isEssential)
  const nonEssentialCategories = allCategories.filter(cat => !CATEGORY_INFO[cat].isEssential)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrencySimple(totalExpenses)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Net Cash Flow</div>
          <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrencySimple(netCashFlow)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Expense %</div>
          <div className={`text-2xl font-bold ${
            expensePercentage <= 80 ? 'text-green-400' :
            expensePercentage <= 100 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {expensePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Essential Expenses</div>
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrencySimple(essentialTotal)}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {expensePercentage > 100 && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-400 mb-1">Expenses Exceed Income</div>
            <div className="text-sm text-gray-300">
              You're spending £{(totalExpenses - monthlyIncome).toFixed(2)} more than you earn each month. Consider reducing expenses or increasing income.
            </div>
          </div>
        </div>
      )}

      {/* Essential Expenses */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          Essential Expenses
        </h3>
        <div className="space-y-3">
          {essentialCategories.map(category => {
            const info = CATEGORY_INFO[category]
            const amount = getExpense(category)
            const notes = getNotes(category)
            const suggestion = getSuggestion(category)
            const isExpanded = expandedCategories.has(category)
            const recommended = suggestion?.suggestedAmount || (info.recommendedPercentage ? (monthlyIncome * info.recommendedPercentage) / 100 : 0)
            const isOverBudget = suggestion?.isOverBudget || false

            return (
              <div key={category} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{info.name}</div>
                      <div className="text-sm text-gray-400">{info.description}</div>
                    </div>
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => toggleCategory(category)}
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  )}
                </div>
                {isExpanded && !readOnly && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount || ''}
                        onChange={(e) => updateExpense(category, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                      <textarea
                        value={notes || ''}
                        onChange={(e) => updateExpense(category, amount, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
                        rows={2}
                        placeholder="Add notes..."
                      />
                    </div>
                  </motion.div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-400">
                    {amount > 0 ? (
                      <>
                        Current: <span className="font-semibold text-white">{formatCurrencySimple(amount)}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                  </div>
                  {suggestion && recommended > 0 && (
                    <div className={`text-sm ${isOverBudget ? 'text-red-400' : 'text-gray-400'}`}>
                      Recommended: {formatCurrencySimple(recommended)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Non-Essential Expenses */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" />
          Non-Essential Expenses
        </h3>
        <div className="space-y-3">
          {nonEssentialCategories.map(category => {
            const info = CATEGORY_INFO[category]
            const amount = getExpense(category)
            const notes = getNotes(category)
            const suggestion = getSuggestion(category)
            const isExpanded = expandedCategories.has(category)
            const recommended = suggestion?.suggestedAmount || (info.recommendedPercentage ? (monthlyIncome * info.recommendedPercentage) / 100 : 0)
            const isOverBudget = suggestion?.isOverBudget || false

            return (
              <div key={category} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{info.name}</div>
                      <div className="text-sm text-gray-400">{info.description}</div>
                    </div>
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => toggleCategory(category)}
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  )}
                </div>
                {isExpanded && !readOnly && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount || ''}
                        onChange={(e) => updateExpense(category, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                      <textarea
                        value={notes || ''}
                        onChange={(e) => updateExpense(category, amount, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
                        rows={2}
                        placeholder="Add notes..."
                      />
                    </div>
                  </motion.div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-400">
                    {amount > 0 ? (
                      <>
                        Current: <span className="font-semibold text-white">{formatCurrencySimple(amount)}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                  </div>
                  {suggestion && recommended > 0 && (
                    <div className={`text-sm ${isOverBudget ? 'text-yellow-400' : 'text-gray-400'}`}>
                      Recommended: {formatCurrencySimple(recommended)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

