import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, TrendingUp, Target, Calendar, AlertCircle, CheckCircle2, DollarSign, Calculator } from 'lucide-react'
import { productsApi, EmergencyFundStatus } from '../services/financeApi'
import { expenseApi, CategoryExpense, ExpenseCategoryType } from '../services/expenseApi'
// import { useGameStore } from '../store/useGameStore' // Reserved for future use
import { useToastStore } from '../store/useToastStore'
import ExpenseBreakdown from './ExpenseBreakdown'
import ScenarioAnalysis from './ScenarioAnalysis'
import EmergencyFundDecisionClarifier from './EmergencyFundDecisionClarifier'
import { formatCurrencySimple } from '../utils/currency'
import { logger } from '../lib/logger'

/**
 * EmergencyFundTracker Component
 * 
 * Comprehensive emergency fund tracking component with:
 * - Goal setting
 * - Progress tracking
 * - Health monitoring
 * - Visualizations
 * - Recommendations
 */
export default function EmergencyFundTracker() {
  // const { dashboard } = useGameStore() // Reserved for future use
  const { addToast } = useToastStore()
  const [status, setStatus] = useState<EmergencyFundStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [useDetailedExpenses, setUseDetailedExpenses] = useState(false)
  const [showScenarioAnalysis, setShowScenarioAnalysis] = useState(false)
  const [useDecisionClarifier, setUseDecisionClarifier] = useState(true) // Default to new decision clarifier
  
  // Form state
  const [goalForm, setGoalForm] = useState({
    targetAmount: '',
    monthsCoverage: '6',
    monthlyExpenses: '',
    monthlyIncome: '',
  })
  const [expenses, setExpenses] = useState<CategoryExpense[]>([])
  const [progressForm, setProgressForm] = useState({
    amount: '',
    notes: '',
  })

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setLoading(true)
      // TODO: Get actual userId from auth
      const userId = 'demo-user-id'
      const data = await productsApi.getEmergencyFundStatus(userId)
      setStatus(data)
      if (!data.exists) {
        setShowGoalForm(true)
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Could not load emergency fund status'
      logger.error('❌ Error loading emergency fund status:', {
        error,
        errorMessage,
        userId: 'demo-user-id',
        timestamp: new Date().toISOString(),
      })
      addToast({
        type: 'error',
        title: 'Failed to Load Emergency Fund Status',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userId = 'demo-user-id' // TODO: Get from auth
      let monthlyExpenses = parseFloat(goalForm.monthlyExpenses)
      
      // If using detailed expenses, save them and calculate total
      if (useDetailedExpenses && goalForm.monthlyIncome) {
        const income = parseFloat(goalForm.monthlyIncome)
        await expenseApi.createOrUpdate({
          userId,
          monthlyIncome: income,
          expenses,
        })
        monthlyExpenses = expenses
          .filter(e => {
            // Only count essential expenses for emergency fund calculation
            const essentialCategories = [
              ExpenseCategoryType.HOUSING,
              ExpenseCategoryType.FOOD,
              ExpenseCategoryType.TRANSPORTATION,
              ExpenseCategoryType.UTILITIES,
              ExpenseCategoryType.INSURANCE,
              ExpenseCategoryType.HEALTHCARE,
              ExpenseCategoryType.DEBT_PAYMENTS,
            ]
            return essentialCategories.includes(e.category)
          })
          .reduce((sum, e) => sum + e.amount, 0)
      }
      
      const result = await productsApi.setEmergencyFundGoal({
        userId,
        targetAmount: parseFloat(goalForm.targetAmount),
        monthsCoverage: parseInt(goalForm.monthsCoverage),
        monthlyExpenses,
      })
      setStatus(result)
      setShowGoalForm(false)
      setGoalForm({ targetAmount: '', monthsCoverage: '6', monthlyExpenses: '', monthlyIncome: '' })
      setExpenses([])
      addToast({
        type: 'success',
        title: 'Goal Set!',
        message: 'Emergency fund goal has been set',
      })
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to set emergency fund goal'
      logger.error('❌ Error setting emergency fund goal:', {
        error,
        errorMessage,
        goalForm,
        userId: 'demo-user-id',
        timestamp: new Date().toISOString(),
      })
      addToast({
        type: 'error',
        title: 'Failed to Set Emergency Fund Goal',
        message: errorMessage,
      })
    }
  }

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userId = 'demo-user-id' // TODO: Get from auth
      const result = await productsApi.updateEmergencyFundProgress({
        userId,
        amount: parseFloat(progressForm.amount),
        notes: progressForm.notes || undefined,
      })
      setStatus(result)
      setShowProgressForm(false)
      setProgressForm({ amount: '', notes: '' })
      addToast({
        type: 'success',
        title: 'Progress Updated!',
        message: 'Emergency fund progress has been updated',
      })
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update emergency fund progress'
      logger.error('❌ Error updating emergency fund progress:', {
        error,
        errorMessage,
        progressForm,
        userId: 'demo-user-id',
        timestamp: new Date().toISOString(),
      })
      addToast({
        type: 'error',
        title: 'Failed to Update Emergency Fund Progress',
        message: errorMessage,
      })
    }
  }

  const handleCalculateRequired = async () => {
    let monthlyExpenses = 0
    
    if (useDetailedExpenses) {
      // Calculate from detailed expenses (essential only)
      monthlyExpenses = expenses
        .filter(e => {
          const essentialCategories = [
            ExpenseCategoryType.HOUSING,
            ExpenseCategoryType.FOOD,
            ExpenseCategoryType.TRANSPORTATION,
            ExpenseCategoryType.UTILITIES,
            ExpenseCategoryType.INSURANCE,
            ExpenseCategoryType.HEALTHCARE,
            ExpenseCategoryType.DEBT_PAYMENTS,
          ]
          return essentialCategories.includes(e.category)
        })
        .reduce((sum, e) => sum + e.amount, 0)
      
      if (monthlyExpenses === 0) {
        addToast({
          type: 'error',
          title: 'Missing Information',
          message: 'Please enter your essential expenses',
        })
        return
      }
    } else {
      if (!goalForm.monthlyExpenses) {
        addToast({
          type: 'error',
          title: 'Missing Information',
          message: 'Please enter monthly expenses',
        })
        return
      }
      monthlyExpenses = parseFloat(goalForm.monthlyExpenses)
    }
    
    try {
      const result = await productsApi.calculateEmergencyFundRequired({
        monthlyExpenses,
        monthsCoverage: parseInt(goalForm.monthsCoverage),
      })
      setGoalForm({
        ...goalForm,
        targetAmount: result.requiredAmount.toString(),
      })
    } catch (error) {
      logger.error('Error calculating required:', error)
    }
  }

  const handleExpensesChange = (newExpenses: CategoryExpense[]) => {
    setExpenses(newExpenses)
    // Auto-calculate total for simple mode
    const essentialTotal = newExpenses
      .filter(e => {
        const essentialCategories = [
          ExpenseCategoryType.HOUSING,
          ExpenseCategoryType.FOOD,
          ExpenseCategoryType.TRANSPORTATION,
          ExpenseCategoryType.UTILITIES,
          ExpenseCategoryType.INSURANCE,
          ExpenseCategoryType.HEALTHCARE,
          ExpenseCategoryType.DEBT_PAYMENTS,
        ]
        return essentialCategories.includes(e.category)
      })
      .reduce((sum, e) => sum + e.amount, 0)
    
    if (essentialTotal > 0) {
      setGoalForm({
        ...goalForm,
        monthlyExpenses: essentialTotal.toString(),
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">Loading emergency fund tracker...</div>
      </div>
    )
  }

  // Show decision clarifier for new users or if explicitly chosen
  if ((!status || !status.exists) && useDecisionClarifier) {
    return <EmergencyFundDecisionClarifier />
  }

  if (!status || !status.exists) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Emergency Fund Tracker</h2>
          <button
            onClick={() => setUseDecisionClarifier(true)}
            className="ml-auto text-sm text-blue-400 hover:text-blue-300"
          >
            Use Decision Clarifier
          </button>
        </div>

        {showGoalForm ? (
          <form onSubmit={handleSetGoal} className="space-y-4">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setUseDetailedExpenses(false)
                  setShowScenarioAnalysis(false)
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !useDetailedExpenses && !showScenarioAnalysis
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Simple Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseDetailedExpenses(true)
                  setShowScenarioAnalysis(false)
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  useDetailedExpenses && !showScenarioAnalysis
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Calculator className="w-4 h-4 inline mr-2" />
                Detailed Breakdown
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowScenarioAnalysis(true)
                  setUseDetailedExpenses(false)
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  showScenarioAnalysis
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Scenario Analysis
              </button>
            </div>

            {showScenarioAnalysis ? (
              <ScenarioAnalysis />
            ) : useDetailedExpenses ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Income</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goalForm.monthlyIncome}
                    onChange={(e) => setGoalForm({ ...goalForm, monthlyIncome: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Enter your monthly income"
                  />
                </div>
                {goalForm.monthlyIncome && (
                  <ExpenseBreakdown
                    monthlyIncome={parseFloat(goalForm.monthlyIncome) || 0}
                    expenses={expenses}
                    onExpensesChange={handleExpensesChange}
                    onCalculateTotal={(total) => {
                      setGoalForm({ ...goalForm, monthlyExpenses: total.toString() })
                    }}
                    showSuggestions={true}
                  />
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Expenses</label>
                <input
                  type="number"
                  step="0.01"
                  required={!useDetailedExpenses}
                  value={goalForm.monthlyExpenses}
                  onChange={(e) => setGoalForm({ ...goalForm, monthlyExpenses: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Enter your monthly expenses"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Tip: Use "Detailed Breakdown" for a more accurate calculation based on your essential expenses
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Months Coverage</label>
              <select
                value={goalForm.monthsCoverage}
                onChange={(e) => setGoalForm({ ...goalForm, monthsCoverage: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="3">3 months</option>
                <option value="6">6 months (recommended)</option>
                <option value="9">9 months</option>
                <option value="12">12 months</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Target emergency fund amount"
                />
              </div>
              <button
                type="button"
                onClick={handleCalculateRequired}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
              >
                Calculate
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
              >
                Set Goal
              </button>
              <button
                type="button"
                onClick={() => setShowGoalForm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No emergency fund goal set yet</p>
            <button
              onClick={() => setShowGoalForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
            >
              Set Emergency Fund Goal
            </button>
          </div>
        )}
      </motion.div>
    )
  }

  const { emergencyFund, health, progress, remaining, isGoalMet } = status

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Emergency Fund Tracker</h2>
        </div>
        <button
          onClick={() => setShowProgressForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
        >
          Update Progress
        </button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Current Amount</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrencySimple(emergencyFund?.currentAmount || 0)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Target Goal</div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatCurrencySimple(emergencyFund?.goal.targetAmount || 0)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Progress</div>
          <div className="text-2xl font-bold text-green-400">
            {progress.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progress to Goal</span>
          {isGoalMet && (
            <span className="text-sm text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Goal Met!
            </span>
          )}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${isGoalMet ? 'bg-green-500' : 'bg-blue-500'}`}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
          <span>{formatCurrencySimple(emergencyFund?.currentAmount || 0)}</span>
          <span>Remaining: {formatCurrencySimple(remaining)}</span>
        </div>
      </div>

      {/* Health Status */}
      {health && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          health.status === 'EXCELLENT' ? 'border-green-500 bg-green-500/10' :
          health.status === 'GOOD' ? 'border-blue-500 bg-blue-500/10' :
          health.status === 'MODERATE' ? 'border-yellow-500 bg-yellow-500/10' :
          health.status === 'LOW' ? 'border-orange-500 bg-orange-500/10' :
          'border-red-500 bg-red-500/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className={`w-5 h-5 ${
              health.status === 'EXCELLENT' ? 'text-green-400' :
              health.status === 'GOOD' ? 'text-blue-400' :
              health.status === 'MODERATE' ? 'text-yellow-400' :
              health.status === 'LOW' ? 'text-orange-400' :
              'text-red-400'
            }`} />
            <h3 className="font-semibold">Fund Health: {health.status}</h3>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            You have {health.monthsCovered.toFixed(1)} months of expenses covered
          </p>
          <div className="space-y-1">
            {health.recommendations.map((rec, idx) => (
              <p key={idx} className="text-sm text-gray-400">• {rec}</p>
            ))}
          </div>
        </div>
      )}

      {/* Goal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Coverage Target</span>
          </div>
          <div className="text-lg font-semibold">
            {emergencyFund?.goal.monthsCoverage} months
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Monthly Expenses</span>
          </div>
          <div className="text-lg font-semibold">
            {formatCurrencySimple(emergencyFund?.goal.monthlyExpenses || 0)}
          </div>
        </div>
      </div>

      {/* Progress History */}
      {emergencyFund?.progressHistory && emergencyFund.progressHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Progress History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {emergencyFund.progressHistory.slice().reverse().map((entry, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{formatCurrencySimple(entry.amount)}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>
                  )}
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Progress Form Modal */}
      {showProgressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
          >
            <h3 className="text-xl font-bold mb-4">Update Progress</h3>
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={progressForm.amount}
                  onChange={(e) => setProgressForm({ ...progressForm, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Enter current emergency fund amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={progressForm.notes}
                  onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  rows={3}
                  placeholder="Add notes about this update..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowProgressForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

