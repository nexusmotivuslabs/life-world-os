import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { portfolioRebalancingApi } from '../services/api'
import { useToastStore } from '../store/useToastStore'
import { RebalancingRecommendation } from '../types'

interface RebalancingRecommendationsProps {
  availableGold?: number
  onConfigNeeded?: () => void
}

export default function RebalancingRecommendations({
  availableGold,
  onConfigNeeded,
}: RebalancingRecommendationsProps) {
  const { addToast } = useToastStore()
  const [recommendations, setRecommendations] = useState<RebalancingRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [availableGold])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const data = await portfolioRebalancingApi.getRecommendations(availableGold)
      setRecommendations(data.recommendations)
    } catch (error: any) {
      if (error?.status === 404) {
        onConfigNeeded?.()
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Load Recommendations',
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
        <div className="text-center py-8 text-gray-400">Loading recommendations...</div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h2 className="text-2xl font-bold">Rebalancing Recommendations</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p>Your portfolio is currently balanced. No rebalancing needed at this time.</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount))
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-700'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
      case 'low':
        return 'text-blue-400 bg-blue-900/20 border-blue-700'
      default:
        return 'text-gray-400 bg-gray-700 border-gray-600'
    }
  }

  const handleExecuteRecommendation = (rec: RebalancingRecommendation) => {
    // This would typically trigger a rebalancing action
    // For now, just show a message
    addToast({
      type: 'info',
      title: 'Rebalancing Action',
      message: `To execute: ${rec.action === 'contribute' ? 'Contribute' : rec.action === 'buy' ? 'Buy' : 'Sell'} ${formatCurrency(rec.adjustment)} of ${rec.assetClass}`,
    })
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-5 h-5 text-yellow-400" />
        <h2 className="text-2xl font-bold">Rebalancing Recommendations</h2>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={`${rec.assetClass}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {rec.assetClass === 'STOCKS' ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{rec.assetClass}</h3>
                  <span className="text-sm opacity-75">
                    {rec.currentPercent.toFixed(2)}% → {rec.targetPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                {rec.priority.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-400">Drift:</span>
                <span className="ml-2 font-medium">{formatPercent(rec.drift)}</span>
              </div>
              <div>
                <span className="text-gray-400">Adjustment:</span>
                <span className="ml-2 font-medium">{formatCurrency(rec.adjustment)}</span>
              </div>
              <div>
                <span className="text-gray-400">Action:</span>
                <span className="ml-2 font-medium capitalize">{rec.action}</span>
              </div>
              <div>
                <span className="text-gray-400">Method:</span>
                <span className="ml-2 font-medium capitalize">{rec.preferredMethod}</span>
              </div>
            </div>

            {rec.preferredMethod === 'contribution' && (
              <div className="bg-blue-900/20 border border-blue-700 rounded p-2 mb-3 text-sm">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Prefer directing new contributions to this asset class
              </div>
            )}

            <button
              onClick={() => handleExecuteRecommendation(rec)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {rec.action === 'contribute' ? 'Contribute' : rec.action === 'buy' ? 'Buy' : 'Sell'}{' '}
              {formatCurrency(rec.adjustment)}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}





