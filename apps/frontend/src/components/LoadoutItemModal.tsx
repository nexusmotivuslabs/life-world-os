/**
 * Loadout Item Modal
 * 
 * Modal showing detailed information about a loadout item, including benefits
 */

import { X, Zap, Shield, TrendingUp, Heart, Sparkles, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadoutItem, LoadoutBenefits } from '../types/loadout'

interface LoadoutItemModalProps {
  item: LoadoutItem
  onClose: () => void
}

export default function LoadoutItemModal({ item, onClose }: LoadoutItemModalProps) {
  const benefits = item.benefits as LoadoutBenefits

  const getBenefitIcon = (key: string) => {
    switch (key) {
      case 'capacity':
        return <Heart className="w-4 h-4 text-pink-400" />
      case 'engines':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'oxygen':
        return <Shield className="w-4 h-4 text-blue-400" />
      case 'meaning':
        return <Sparkles className="w-4 h-4 text-purple-400" />
      case 'optionality':
        return <Target className="w-4 h-4 text-cyan-400" />
      case 'xpGain':
      case 'energyEfficiency':
      case 'energyCostReduction':
        return <Zap className="w-4 h-4 text-yellow-400" />
      default:
        return <Zap className="w-4 h-4 text-gray-400" />
    }
  }

  const formatBenefit = (key: string, value: number): string => {
    if (key.includes('Gain') || key.includes('Efficiency') || key.includes('Reduction')) {
      // Percentage modifier
      const percentage = (value * 100).toFixed(1)
      return value > 0 ? `+${percentage}%` : `${percentage}%`
    } else {
      // Stat bonus
      return value > 0 ? `+${value}` : `${value}`
    }
  }

  const getBenefitLabel = (key: string): string => {
    const labels: Record<string, string> = {
      capacity: 'Capacity',
      engines: 'Engines',
      oxygen: 'Oxygen',
      meaning: 'Meaning',
      optionality: 'Optionality',
      xpGain: 'XP Gain',
      energyEfficiency: 'Energy Efficiency',
      energyCostReduction: 'Energy Cost Reduction',
    }
    return labels[key] || key
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="text-sm text-gray-400 mt-1">Power Level: {item.powerLevel}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-300">{item.description}</p>
            </div>

            {/* Benefits */}
            {benefits && Object.keys(benefits).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Benefits</h3>
                <div className="space-y-2">
                  {Object.entries(benefits).map(([key, value]) => {
                    if (typeof value !== 'number') return null
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getBenefitIcon(key)}
                          <span className="text-sm text-gray-300">
                            {getBenefitLabel(key)}
                          </span>
                        </div>
                        <span className="font-semibold text-green-400">
                          {formatBenefit(key, value)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Gameplay Impact */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h3 className="font-semibold mb-2 text-purple-300">Gameplay Impact</h3>
              <p className="text-sm text-gray-300">
                This item affects your stats and action outcomes. Higher power level items
                provide greater benefits and contribute more to your overall power level.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}





