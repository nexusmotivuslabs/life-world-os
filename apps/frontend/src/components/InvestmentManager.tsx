import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Plus, DollarSign, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { investmentsApi } from '../services/api'
import { useGameStore } from '../store/useGameStore'
import { useToastStore } from '../store/useToastStore'
import { InvestmentType } from '../types'
import InvestmentAllocation from './InvestmentAllocation'
import InvestmentCard from './InvestmentCard'
import { logger } from '../lib/logger'

interface Investment {
  id: string
  type: InvestmentType
  name: string
  description?: string
  amount: number
  initialAmount: number
  expectedYield: number
  currentValue: number
  totalReturn: number
  createdAt: string
  lastUpdated: string
}

interface InvestmentSummary {
  investments: Investment[]
  totalsByType: Record<InvestmentType, number>
  totalInvested: number
  totalValue: number
  totalReturn: number
}

export default function InvestmentManager() {
  const { dashboard, fetchDashboard } = useGameStore()
  const { addToast } = useToastStore()
  const [summary, setSummary] = useState<InvestmentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllocation, setShowAllocation] = useState(false)

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = async () => {
    try {
      setLoading(true)
      const data = await investmentsApi.getInvestments()
      setSummary(data)
    } catch (error) {
      logger.error('Failed to load investments:', error)
      addToast({
        type: 'error',
        title: 'Failed to Load Investments',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInvestmentCreated = async () => {
    await loadInvestments()
    await fetchDashboard()
  }

  const handleInvestmentDeleted = async () => {
    await loadInvestments()
    await fetchDashboard()
  }

  const getTypeIcon = (type: InvestmentType) => {
    switch (type) {
      case InvestmentType.CRYPTO:
        return '₿'
      case InvestmentType.STOCKS:
        return '📈'
      case InvestmentType.CASH:
        return '💵'
      case InvestmentType.HIGH_YIELD_SAVINGS:
        return '🏦'
      default:
        return '💰'
    }
  }

  const getTypeColor = (type: InvestmentType) => {
    switch (type) {
      case InvestmentType.CRYPTO:
        return 'text-orange-400'
      case InvestmentType.STOCKS:
        return 'text-green-400'
      case InvestmentType.CASH:
        return 'text-blue-400'
      case InvestmentType.HIGH_YIELD_SAVINGS:
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">Loading investments...</div>
      </div>
    )
  }

  const availableGold = dashboard?.resources.gold || 0
  const totalInvested = summary?.totalInvested || 0
  const totalValue = summary?.totalValue || 0
  const totalReturn = summary?.totalReturn || 0
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Investment Portfolio</h2>
        </div>
        <button
          onClick={() => setShowAllocation(!showAllocation)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showAllocation ? 'Hide Allocation' : 'New Investment'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Available Gold</div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatCurrency(availableGold)}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Invested</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalInvested)}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Current Value</div>
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(totalValue)}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Return</div>
          <div className={`text-2xl font-bold flex items-center gap-1 ${
            totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {totalReturn >= 0 ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
            {formatCurrency(Math.abs(totalReturn))}
            <span className="text-sm ml-1">
              ({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Allocation by Type */}
      {summary && Object.keys(summary.totalsByType).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Allocation by Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(summary.totalsByType).map(([type, amount]) => {
              const typeEnum = type as InvestmentType
              const percentage = totalInvested > 0 ? (amount / totalInvested) * 100 : 0
              return (
                <div
                  key={type}
                  className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl ${getTypeColor(typeEnum)}`}>
                      {getTypeIcon(typeEnum)}
                    </span>
                    <span className="text-sm text-gray-400">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(amount)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New Investment Form */}
      {showAllocation && (
        <div className="mb-6">
          <InvestmentAllocation
            availableGold={availableGold}
            onInvestmentCreated={handleInvestmentCreated}
            onCancel={() => setShowAllocation(false)}
          />
        </div>
      )}

      {/* Investment List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Your Investments</h3>
        {summary && summary.investments.length > 0 ? (
          <div className="space-y-3">
            {summary.investments.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onUpdate={loadInvestments}
                onDelete={handleInvestmentDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No investments yet. Create your first investment to start growing your gold!</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}


