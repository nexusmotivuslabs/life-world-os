import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, X } from 'lucide-react'
import { investmentsApi } from '../services/api'
import { useToastStore } from '../store/useToastStore'
import { InvestmentType } from '../types'
import { calculateInvestmentXP } from '../lib/investmentCalculator'

const allocationSchema = z.object({
  type: z.nativeEnum(InvestmentType),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  expectedYield: z.number().min(0).max(100).optional(),
})

type AllocationFormData = z.infer<typeof allocationSchema>

interface InvestmentAllocationProps {
  availableGold: number
  onInvestmentCreated: () => void
  onCancel: () => void
}

const INVESTMENT_TYPE_INFO = {
  [InvestmentType.CRYPTO]: {
    label: 'Cryptocurrency',
    icon: '₿',
    description: 'Digital assets like Bitcoin, Ethereum',
    defaultYield: 0,
    recommended: 'High risk, high reward. Consider 5-15% of portfolio.',
    color: 'text-orange-400',
  },
  [InvestmentType.STOCKS]: {
    label: 'Stocks',
    icon: '📈',
    description: 'Stock market investments, ETFs, index funds',
    defaultYield: 7.0,
    recommended: 'Balanced growth. Consider 50-70% of portfolio.',
    color: 'text-green-400',
  },
  [InvestmentType.CASH]: {
    label: 'Cash',
    icon: '💵',
    description: 'Physical cash or checking account',
    defaultYield: 0,
    recommended: 'Liquidity and safety. Consider 5-10% of portfolio.',
    color: 'text-blue-400',
  },
  [InvestmentType.HIGH_YIELD_SAVINGS]: {
    label: 'High-Yield Savings',
    icon: '🏦',
    description: 'High-yield savings accounts (4-5% APY)',
    defaultYield: 4.5,
    recommended: 'Safe growth. Consider 20-30% of portfolio.',
    color: 'text-purple-400',
  },
}

export default function InvestmentAllocation({
  availableGold,
  onInvestmentCreated,
  onCancel,
}: InvestmentAllocationProps) {
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(false)
  const [previewXP, setPreviewXP] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AllocationFormData>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      type: InvestmentType.HIGH_YIELD_SAVINGS,
      expectedYield: 4.5,
    },
  })

  const selectedType = watch('type')
  const amount = watch('amount')
  const typeInfo = INVESTMENT_TYPE_INFO[selectedType]

  // Step 8: Preview calculation - UI-only, does not affect game state
  // Actual XP is computed by backend with all mechanics (Capacity modifiers, burnout penalties, etc.)
  // This preview is only for UI display, actual submission uses backend-calculated values
  const amountValue = watch('amount')
  const typeValue = watch('type')
  
  useEffect(() => {
    if (amountValue && amountValue > 0) {
      const xp = calculateInvestmentXP(typeValue, amountValue)
      setPreviewXP(xp)
    } else {
      setPreviewXP(null)
    }
  }, [amountValue, typeValue])

  const onSubmit = async (data: AllocationFormData) => {
    if (data.amount > availableGold) {
      addToast({
        type: 'error',
        title: 'Insufficient Gold',
        message: `You only have ${availableGold.toLocaleString()} gold available`,
      })
      return
    }

    setLoading(true)
    try {
      const result = await investmentsApi.createInvestment({
        type: data.type,
        name: data.name,
        description: data.description,
        amount: data.amount,
        expectedYield: data.expectedYield || typeInfo.defaultYield,
      })

      // Show XP gain notification
      if (result.xpGained) {
        const xpGained = result.xpGained
        const categoryGains = Object.entries(xpGained.category || {})
          .filter(([_, xp]: [string, unknown]) => typeof xp === 'number' && xp > 0)
          .map(([cat, xp]: [string, unknown]) => `${cat}: +${xp}`)
          .join(', ')

        addToast({
          type: 'success',
          title: `Investment Created! +${xpGained.overall} XP`,
          message: categoryGains || 'XP earned',
          duration: 6000,
        })
      }

      reset()
      setPreviewXP(null)
      onInvestmentCreated()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Create Investment',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-700 rounded-lg p-6 border border-gray-600"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Create New Investment</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Investment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Investment Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(INVESTMENT_TYPE_INFO).map(([type, info]) => {
              const typeEnum = type as InvestmentType
              const isSelected = selectedType === typeEnum
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    reset({
                      ...watch(),
                      type: typeEnum,
                      expectedYield: info.defaultYield,
                    })
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className={`text-2xl mb-1 ${info.color}`}>{info.icon}</div>
                  <div className="text-sm font-medium">{info.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{info.description}</div>
                </button>
              )
            })}
          </div>
          <input type="hidden" {...register('type')} />
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Investment Name
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g., Bitcoin, S&P 500 Index, Emergency Fund"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (Gold)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Available: {availableGold.toLocaleString()} gold
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Expected Annual Yield (%)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('expectedYield', { valueAsNumber: true })}
            placeholder={typeInfo.defaultYield.toString()}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Default: {typeInfo.defaultYield}% | {typeInfo.recommended}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            {...register('description')}
            placeholder="Add notes about this investment..."
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* XP Preview */}
        {previewXP && amount && amount > 0 && (
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">XP Preview</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-300">Overall XP:</span>
                <span className="text-yellow-400 font-bold">+{previewXP.overall}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(previewXP.category || {}).map(([cat, xp]: [string, any]) => {
                  if (xp <= 0) return null
                  const colors: Record<string, string> = {
                    capacity: 'text-green-400',
                    engines: 'text-blue-400',
                    oxygen: 'text-cyan-400',
                    meaning: 'text-purple-400',
                    optionality: 'text-orange-400',
                  }
                  return (
                    <div key={cat}>
                      <span className="text-gray-400">{cat}:</span>
                      <span className={`ml-2 ${colors[cat] || 'text-gray-400'}`}>
                        +{xp}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Creating...' : 'Create Investment'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

