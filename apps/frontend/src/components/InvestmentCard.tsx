import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Edit2, Trash2, DollarSign } from 'lucide-react'
import { investmentsApi } from '../services/api'
import { useToastStore } from '../store/useToastStore'
import { InvestmentType } from '../types'

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

interface InvestmentCardProps {
  investment: Investment
  onUpdate: () => void
  onDelete: () => void
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
      return 'border-orange-500/50 bg-orange-500/10'
    case InvestmentType.STOCKS:
      return 'border-green-500/50 bg-green-500/10'
    case InvestmentType.CASH:
      return 'border-blue-500/50 bg-blue-500/10'
    case InvestmentType.HIGH_YIELD_SAVINGS:
      return 'border-purple-500/50 bg-purple-500/10'
    default:
      return 'border-gray-500/50 bg-gray-500/10'
  }
}

export default function InvestmentCard({
  investment,
  onUpdate,
  onDelete,
}: InvestmentCardProps) {
  const { addToast } = useToastStore()
  const [deleting, setDeleting] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const returnPercentage = (investment.totalReturn / investment.initialAmount) * 100
  const isPositive = investment.totalReturn >= 0

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to sell/withdraw "${investment.name}"?`)) {
      return
    }

    setDeleting(true)
    try {
      const result = await investmentsApi.deleteInvestment(investment.id)
      addToast({
        type: 'success',
        title: 'Investment Sold',
        message: `Returned ${formatCurrency(result.returnedGold)} to your gold`,
      })
      onDelete()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Sell Investment',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 ${getTypeColor(investment.type)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{getTypeIcon(investment.type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{investment.name}</h4>
              <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-700 rounded">
                {investment.type.replace(/_/g, ' ')}
              </span>
            </div>
            {investment.description && (
              <p className="text-sm text-gray-400 mb-2">{investment.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Invested</div>
                <div className="text-sm font-medium">{formatCurrency(investment.amount)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Current Value</div>
                <div className="text-sm font-medium text-green-400">
                  {formatCurrency(investment.currentValue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Total Return</div>
                <div className={`text-sm font-medium flex items-center gap-1 ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatCurrency(Math.abs(investment.totalReturn))}
                  <span className="text-xs">
                    ({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Expected Yield</div>
                <div className="text-sm font-medium">{investment.expectedYield.toFixed(1)}% APY</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 disabled:opacity-50"
            title="Sell/Withdraw"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}


