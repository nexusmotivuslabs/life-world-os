/**
 * Loadout Item Modal (Gunsmith-style individual item view)
 *
 * Full-screen style view for a single loadout item: title bar, slot badge,
 * description, and stat bars (Accuracy / Damage / Range style from benefits).
 */

import { X, Zap, Shield, TrendingUp, Heart, Sparkles, Target, Award, Lock, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadoutItem, LoadoutBenefits, LoadoutSlotType, SLOT_TYPE_LABELS } from '../types/loadout'
import {
  LOADOUT_RANK_TIERS,
  DEFAULT_CURRENT_RANK_ID,
  RANK_TIER_BY_ID,
} from '../config/loadoutRankConfig'

interface LoadoutItemModalProps {
  item: LoadoutItem
  onClose: () => void
}

const BENEFIT_CONFIG: { key: string; label: string; description: string; icon: React.ReactNode; max?: number }[] = [
  { key: 'capacity', label: 'Capacity', description: 'Foundation for system performance. High Capacity enables sustained operation across Finance, Health, and Energy. Low Capacity degrades effectiveness and increases burnout risk.', icon: <Heart className="w-4 h-4 text-pink-400" />, max: 100 },
  { key: 'engines', label: 'Engines', description: 'Income generation capability. Governs multiple income sources and unlocks higher-value actions.', icon: <TrendingUp className="w-4 h-4 text-green-400" />, max: 100 },
  { key: 'oxygen', label: 'Oxygen', description: 'Financial safety net measured in months of expenses. Primary survival buffer; enables risk-taking when high.', icon: <Shield className="w-4 h-4 text-blue-400" />, max: 100 },
  { key: 'meaning', label: 'Meaning', description: 'Purpose and values alignment. Provides burnout resistance and prevents decay when actions align with values.', icon: <Sparkles className="w-4 h-4 text-purple-400" />, max: 100 },
  { key: 'optionality', label: 'Optionality', description: 'Available choices and pathways. Increases with investments, keys, and unlocked systems.', icon: <Target className="w-4 h-4 text-cyan-400" />, max: 100 },
  { key: 'xpGain', label: 'XP Gain', description: 'Multiplier on experience gained from actions. Higher values accelerate progression in stat clouds.', icon: <Zap className="w-4 h-4 text-yellow-400" />, max: 0.5 },
  { key: 'energyEfficiency', label: 'Energy Efficiency', description: 'Reduces energy consumed per action. Lets you do more with the same energy cap.', icon: <Zap className="w-4 h-4 text-amber-400" />, max: 0.5 },
  { key: 'energyCostReduction', label: 'Energy Cost Reduction', description: 'Lowers the base energy cost of actions. Stacks with Capacity and efficiency modifiers.', icon: <Zap className="w-4 h-4 text-orange-400" />, max: 0.5 },
]

function formatBenefitValue(key: string, value: number): string {
  if (key.includes('Gain') || key.includes('Efficiency') || key.includes('Reduction')) {
    const pct = (value * 100).toFixed(1)
    return value > 0 ? `+${pct}%` : `${pct}%`
  }
  return value > 0 ? `+${value}` : `${value}`
}

/** Normalize value to 0–100 for bar display (stats 0–100, percentages 0–50% -> 0–100) */
function barPercent(key: string, value: number, max?: number): number {
  const cap = max ?? 100
  const raw = typeof value !== 'number' ? 0 : value
  if (key.includes('Gain') || key.includes('Efficiency') || key.includes('Reduction')) {
    return Math.min(100, Math.max(0, (raw / (cap || 0.5)) * 100))
  }
  return Math.min(100, Math.max(0, (raw / cap) * 100))
}

export default function LoadoutItemModal({ item, onClose }: LoadoutItemModalProps) {
  const benefits = (item.benefits || {}) as LoadoutBenefits
  const rankTiers = (item.ranking && item.ranking.length > 0
    ? [...item.ranking].sort((a, b) => a.order - b.order)
    : LOADOUT_RANK_TIERS) as typeof LOADOUT_RANK_TIERS
  const currentRankId = DEFAULT_CURRENT_RANK_ID
  const currentOrder = RANK_TIER_BY_ID[currentRankId]?.order ?? 1

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Title bar - Gunsmith style */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/80">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white uppercase tracking-wide">
                {item.name} <span className="text-amber-500">GUNSMITH</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded border border-amber-500/40">
                {SLOT_TYPE_LABELS[item.slotType as LoadoutSlotType]}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Power Level <span className="font-semibold text-white">{item.powerLevel}</span>
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs - single view "DETAILS" */}
          <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-gray-700">
            <span className="px-4 py-2 text-sm font-semibold text-amber-400 border-b-2 border-amber-500 -mb-px">
              DETAILS
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Central: description */}
            <div className="p-5 bg-gray-800/60 rounded-lg border border-gray-700">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Description
              </h2>
              <p className="text-gray-200 leading-relaxed">{item.description}</p>
            </div>

            {/* Equipped / stats summary */}
            <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Item stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {BENEFIT_CONFIG.map(({ key, label, description, icon, max }) => {
                  const value = benefits[key]
                  if (value == null || typeof value !== 'number') return null
                  const pct = barPercent(key, value, max)
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-300" title={`${label} — ${description}`}>
                          {icon}
                          <span className="text-sm cursor-help">{label}</span>
                        </div>
                        <span className="text-sm font-medium text-green-400">
                          {formatBenefitValue(key, value)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-600 to-amber-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              {Object.keys(benefits).filter((k) => typeof benefits[k] === 'number').length === 0 && (
                <p className="text-sm text-gray-500">No stat modifiers for this item.</p>
              )}
            </div>

            {/* Ranking: how to unlock various ranks */}
            <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Ranking
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Unlock ranks by using this item in your active loadout. Your rank: <span className="text-amber-400 font-medium">{RANK_TIER_BY_ID[currentRankId]?.name ?? 'Recruit'}</span>
              </p>
              <ul className="space-y-3">
                {rankTiers.map((tier) => {
                  const isUnlocked = tier.order <= currentOrder
                  const isCurrent = tier.id === currentRankId
                  return (
                    <li
                      key={tier.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        isCurrent
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : isUnlocked
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-gray-600 bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">
                          {isUnlocked ? (
                            <Check className="w-4 h-4 text-green-400" aria-hidden />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" aria-hidden />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isCurrent ? 'text-amber-400' : isUnlocked ? 'text-green-300' : 'text-gray-400'}`}>
                              {tier.name}
                            </span>
                            {isCurrent && (
                              <span className="text-xs text-amber-400/80">(current)</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1" title={tier.howToUnlock}>
                            How to unlock: {tier.howToUnlock}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Gameplay impact */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-300 mb-1">Gameplay impact</h3>
              <p className="text-sm text-gray-300">
                This item affects your stats and action outcomes. Higher power level increases
                your overall loadout strength.
              </p>
            </div>
          </div>

          {/* Footer - Back / Close */}
          <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/60 flex justify-between items-center">
            <span className="text-xs text-gray-500">Press to close</span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
