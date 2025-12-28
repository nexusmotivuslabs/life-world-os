/**
 * ExpenseRangeInput Component
 * 
 * Component for inputting expense ranges (min/max) for scenario analysis.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Info, Calculator } from 'lucide-react'
import { ExpenseCategoryType, CategoryExpense } from '../services/expenseApi'
import { formatCurrencySimple } from '../utils/currency'

const CATEGORY_INFO: Record<ExpenseCategoryType, { name: string; icon: string; description: string; isEssential: boolean }> = {
  [ExpenseCategoryType.HOUSING]: { name: 'Housing', icon: '🏠', description: 'Rent, mortgage, property taxes, maintenance, HOA fees', isEssential: true },
  [ExpenseCategoryType.FOOD]: { name: 'Food', icon: '🍔', description: 'Groceries, dining out, takeout, snacks', isEssential: true },
  [ExpenseCategoryType.TRANSPORTATION]: { name: 'Transportation', icon: '🚗', description: 'Car payments, gas, public transit, parking, maintenance', isEssential: true },
  [ExpenseCategoryType.UTILITIES]: { name: 'Utilities', icon: '💡', description: 'Electric, water, gas, internet, phone, trash', isEssential: true },
  [ExpenseCategoryType.INSURANCE]: { name: 'Insurance', icon: '🛡️', description: 'Health, life, disability, auto, renters/homeowners insurance', isEssential: true },
  [ExpenseCategoryType.HEALTHCARE]: { name: 'Healthcare', icon: '🏥', description: 'Medical bills, prescriptions, doctor visits, dental, vision', isEssential: true },
  [ExpenseCategoryType.DEBT_PAYMENTS]: { name: 'Debt Payments', icon: '💳', description: 'Credit cards, student loans, personal loans, other debts', isEssential: true },
  [ExpenseCategoryType.ENTERTAINMENT]: { name: 'Entertainment', icon: '🎬', description: 'Streaming services, hobbies, games, events, subscriptions', isEssential: false },
  [ExpenseCategoryType.PERSONAL_CARE]: { name: 'Personal Care', icon: '💇', description: 'Haircuts, toiletries, clothing, gym memberships', isEssential: false },
  [ExpenseCategoryType.EDUCATION]: { name: 'Education', icon: '📚', description: 'Tuition, books, courses, training, professional development', isEssential: false },
  [ExpenseCategoryType.SAVINGS_INVESTMENTS]: { name: 'Savings & Investments', icon: '💰', description: 'Emergency fund contributions, retirement savings, investments', isEssential: false },
  [ExpenseCategoryType.MISCELLANEOUS]: { name: 'Miscellaneous', icon: '📦', description: 'Other expenses that don\'t fit into other categories', isEssential: false },
}

export interface ExpenseRange {
  category: ExpenseCategoryType
  min: number
  max: number
}

interface ExpenseRangeInputProps {
  ranges: ExpenseRange[]
  onRangesChange: (ranges: ExpenseRange[]) => void
  monthlyIncome: number
}

export default function ExpenseRangeInput({
  ranges,
  onRangesChange,
  monthlyIncome,
}: ExpenseRangeInputProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ExpenseCategoryType>>(new Set())

  const updateRange = (category: ExpenseCategoryType, min: number, max: number) => {
    const updated = ranges.filter(r => r.category !== category)
    if (min > 0 || max > 0) {
      updated.push({ category, min: Math.max(0, min), max: Math.max(min, max) })
    }
    onRangesChange(updated)
  }

  const getRange = (category: ExpenseCategoryType): ExpenseRange => {
    return ranges.find(r => r.category === category) || { category, min: 0, max: 0 }
  }

  const toggleCategory = (category: ExpenseCategoryType) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const calculateTotalRange = () => {
    const minTotal = ranges.reduce((sum, r) => sum + r.min, 0)
    const maxTotal = ranges.reduce((sum, r) => sum + r.max, 0)
    return { min: minTotal, max: maxTotal, average: (minTotal + maxTotal) / 2 }
  }

  const totalRange = calculateTotalRange()
  const essentialCategories = Object.values(ExpenseCategoryType).filter(cat => CATEGORY_INFO[cat].isEssential)
  const nonEssentialCategories = Object.values(ExpenseCategoryType).filter(cat => !CATEGORY_INFO[cat].isEssential)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-blue-400">Expense Range Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Minimum</div>
            <div className="text-lg font-semibold text-white">{formatCurrencySimple(totalRange.min)}</div>
          </div>
          <div>
            <div className="text-gray-400">Maximum</div>
            <div className="text-lg font-semibold text-white">{formatCurrencySimple(totalRange.max)}</div>
          </div>
          <div>
            <div className="text-gray-400">Average</div>
            <div className="text-lg font-semibold text-blue-400">{formatCurrencySimple(totalRange.average)}</div>
          </div>
        </div>
        {monthlyIncome > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-500/30">
            <div className="text-sm text-gray-400">
              Monthly Surplus Range: {formatCurrencySimple(monthlyIncome - totalRange.max)} - {formatCurrencySimple(monthlyIncome - totalRange.min)}
            </div>
          </div>
        )}
      </div>

      {/* Essential Expenses */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Essential Expenses
        </h3>
        <div className="space-y-3">
          {essentialCategories.map(category => {
            const info = CATEGORY_INFO[category]
            const range = getRange(category)
            const isExpanded = expandedCategories.has(category)

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
                  <button
                    onClick={() => toggleCategory(category)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Minimum ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={range.min || ''}
                          onChange={(e) => updateRange(category, parseFloat(e.target.value) || 0, range.max)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Maximum ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min={range.min}
                          value={range.max || ''}
                          onChange={(e) => updateRange(category, range.min, parseFloat(e.target.value) || range.min)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {range.min > 0 && range.max > 0 && (
                      <div className="text-sm text-gray-400">
                        Range: {formatCurrencySimple(range.min)} - {formatCurrencySimple(range.max)} (Avg: {formatCurrencySimple((range.min + range.max) / 2)})
                      </div>
                    )}
                  </motion.div>
                )}
                {!isExpanded && range.min > 0 && (
                  <div className="mt-2 text-sm text-gray-400">
                    Range: {formatCurrencySimple(range.min)} - {formatCurrencySimple(range.max)}
                  </div>
                )}
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
            const range = getRange(category)
            const isExpanded = expandedCategories.has(category)

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
                  <button
                    onClick={() => toggleCategory(category)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Minimum ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={range.min || ''}
                          onChange={(e) => updateRange(category, parseFloat(e.target.value) || 0, range.max)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Maximum ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min={range.min}
                          value={range.max || ''}
                          onChange={(e) => updateRange(category, range.min, parseFloat(e.target.value) || range.min)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {range.min > 0 && range.max > 0 && (
                      <div className="text-sm text-gray-400">
                        Range: {formatCurrencySimple(range.min)} - {formatCurrencySimple(range.max)} (Avg: {formatCurrencySimple((range.min + range.max) / 2)})
                      </div>
                    )}
                  </motion.div>
                )}
                {!isExpanded && range.min > 0 && (
                  <div className="mt-2 text-sm text-gray-400">
                    Range: {formatCurrencySimple(range.min)} - {formatCurrencySimple(range.max)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

