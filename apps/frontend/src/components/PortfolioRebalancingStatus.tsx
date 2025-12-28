import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { portfolioRebalancingApi } from '../services/api'
import { useToastStore } from '../store/useToastStore'
import { RebalancingStatus } from '../types'

interface PortfolioRebalancingStatusProps {
  availableGold?: number
  onConfigNeeded?: () => void
}

export default function PortfolioRebalancingStatus({
  availableGold,
  onConfigNeeded,
}: PortfolioRebalancingStatusProps) {
  const { addToast } = useToastStore()
  const [status, setStatus] = useState<RebalancingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
  }, [availableGold])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const data = await portfolioRebalancingApi.getStatus(availableGold)
      setStatus(data)
    } catch (error: any) {
      if (error?.status === 404) {
        // Config doesn't exist
        onConfigNeeded?.()
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Load Status',
          message: error instanceof Error ? error.message : 'Please try again',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center py-8 text-gray-400">Loading rebalancing status...</div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center py-8 text-gray-400">
          <p>No rebalancing configuration found.</p>
          <button
            onClick={() => onConfigNeeded?.()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Set Up Rebalancing
          </button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const stocksDrift = status.drift.stocks
  const bondsDrift = status.drift.bonds
  const stocksNeedsRebalancing = Math.abs(stocksDrift) > status.targetAllocation.stocksPercent * (status.targetAllocation.stocksPercent / 100)
  const bondsNeedsRebalancing = Math.abs(bondsDrift) > status.targetAllocation.bondsPercent * (status.targetAllocation.bondsPercent / 100)

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Portfolio Allocation Status</h2>
        {status.needsRebalancing ? (
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Rebalancing Needed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">On Target</span>
          </div>
        )}
      </div>

      {/* Current vs Target Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Stocks */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Stocks</span>
            </div>
            <span className={`text-sm font-medium ${stocksDrift > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatPercent(stocksDrift)}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current:</span>
              <span>{status.currentAllocation.stocksPercent.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Target:</span>
              <span>{status.targetAllocation.stocksPercent.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Value:</span>
              <span>{formatCurrency(status.currentAllocation.stocksValue)}</span>
            </div>
            <div className="h-2 bg-gray-600 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-green-400 transition-all"
                style={{ width: `${Math.min(100, status.currentAllocation.stocksPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bonds */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">Bonds</span>
            </div>
            <span className={`text-sm font-medium ${bondsDrift > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatPercent(bondsDrift)}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current:</span>
              <span>{status.currentAllocation.bondsPercent.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Target:</span>
              <span>{status.targetAllocation.bondsPercent.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Value:</span>
              <span>{formatCurrency(status.currentAllocation.bondsValue)}</span>
            </div>
            <div className="h-2 bg-gray-600 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-purple-400 transition-all"
                style={{ width: `${Math.min(100, status.currentAllocation.bondsPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Portfolio Value:</span>
          <span className="text-xl font-bold">{formatCurrency(status.currentAllocation.totalValue)}</span>
        </div>
      </div>

      {/* Contribution Info */}
      {status.canUseContributions && status.availableContributionAmount && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Contributions Available</span>
          </div>
          <p className="text-sm text-gray-300">
            You have {formatCurrency(status.availableContributionAmount)} available for rebalancing.
            The system will prefer directing new contributions to underweighted assets.
          </p>
        </div>
      )}
    </div>
  )
}


