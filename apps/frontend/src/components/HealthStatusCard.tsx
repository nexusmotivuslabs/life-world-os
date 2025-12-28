import { HeartPulse, AlertTriangle, TrendingUp, TrendingDown, Zap, Activity, Shield } from 'lucide-react'
import { HealthStatus } from '../services/healthApi'
import { motion } from 'framer-motion'

interface HealthStatusCardProps {
  healthStatus: HealthStatus
}

export default function HealthStatusCard({ healthStatus }: HealthStatusCardProps) {
  const { capacity, capacityBand, isInBurnout, consecutiveHighEffortDays, recoveryActionsThisWeek, systems } = healthStatus

  const getCapacityColor = () => {
    switch (capacityBand) {
      case 'critical':
        return 'text-red-400'
      case 'low':
        return 'text-orange-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-green-400'
      case 'optimal':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getCapacityBgColor = () => {
    switch (capacityBand) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30'
      case 'low':
        return 'bg-orange-500/10 border-orange-500/30'
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'high':
        return 'bg-green-500/10 border-green-500/30'
      case 'optimal':
        return 'bg-blue-500/10 border-blue-500/30'
      default:
        return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  const getCapacityGlow = () => {
    const intensity = capacity / 100
    switch (capacityBand) {
      case 'critical':
        return `rgba(239, 68, 68, ${0.2 + intensity * 0.3})`
      case 'low':
        return `rgba(249, 115, 22, ${0.2 + intensity * 0.3})`
      case 'medium':
        return `rgba(234, 179, 8, ${0.2 + intensity * 0.3})`
      case 'high':
        return `rgba(34, 197, 94, ${0.2 + intensity * 0.3})`
      case 'optimal':
        return `rgba(59, 130, 246, ${0.2 + intensity * 0.3})`
      default:
        return `rgba(156, 163, 175, ${0.2 + intensity * 0.3})`
    }
  }

  const glowColor = getCapacityGlow()

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${getCapacityBgColor()}`} />

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <HeartPulse className={`w-8 h-8 ${getCapacityColor()}`} />
            <div>
              <h3 className="text-2xl font-bold text-white">Capacity</h3>
              <p className="text-sm text-gray-400">
                Operating Stability: {capacityBand.charAt(0).toUpperCase() + capacityBand.slice(1)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getCapacityColor()}`}>{capacity}</div>
            <div className="text-sm text-gray-400">/ 100</div>
          </div>
        </div>

        {/* Capacity Visualization */}
        <div className="relative flex items-center justify-center mb-8" style={{ height: '200px' }}>
          {/* Glow effect */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '180px',
              height: '180px',
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
              filter: 'blur(30px)',
            }}
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Heart Pulse Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="relative z-20"
          >
            <div 
              className={`w-32 h-32 rounded-full flex items-center justify-center ${getCapacityBgColor()}`}
              style={{
                boxShadow: `0 0 60px ${glowColor}`,
              }}
            >
              <HeartPulse className={`w-16 h-16 ${getCapacityColor()}`} />
            </div>
          </motion.div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-300">Capacity Level</span>
            <span className={`text-lg font-bold ${getCapacityColor()}`}>
              {capacity}%
            </span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-6 overflow-hidden border-2 border-gray-700">
            <motion.div
              className={`h-full rounded-full ${
                capacityBand === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                capacityBand === 'low' ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                capacityBand === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                capacityBand === 'high' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
              style={{ width: `${capacity}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${capacity}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-3">
          {isInBurnout && (
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <div className="text-sm font-semibold text-red-300">Burnout State</div>
                <div className="text-xs text-red-400">
                  Capacity critically low. Focus on recovery actions (Exercise, Learning, Rest).
                </div>
              </div>
            </div>
          )}

          {systems.burnout.riskLevel === 'high' && !isInBurnout && (
            <div className="flex items-center gap-3 p-4 bg-orange-900/30 border-2 border-orange-500/50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <div>
                <div className="text-sm font-semibold text-orange-300">High Burnout Risk</div>
                <div className="text-xs text-orange-400">
                  Capacity below 30. Burnout risk is high. Prioritize recovery.
                </div>
              </div>
            </div>
          )}

          {consecutiveHighEffortDays >= 7 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-xl">
              <TrendingDown className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-sm font-semibold text-yellow-300">Sustained High Effort</div>
                <div className="text-xs text-yellow-400">
                  {consecutiveHighEffortDays} consecutive high effort days. Capacity decay may apply on weekly tick.
                </div>
              </div>
            </div>
          )}

          {recoveryActionsThisWeek >= 2 && (
            <div className="flex items-center gap-3 p-4 bg-green-900/30 border-2 border-green-500/50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-green-300">Recovery Active</div>
                <div className="text-xs text-green-400">
                  {recoveryActionsThisWeek} recovery actions this week. Capacity recovery will apply on weekly tick.
                </div>
              </div>
            </div>
          )}

          {recoveryActionsThisWeek < 2 && (
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
              <Activity className="w-6 h-6 text-gray-400" />
              <div>
                <div className="text-sm font-semibold text-gray-300">Recovery Needed</div>
                <div className="text-xs text-gray-400">
                  {recoveryActionsThisWeek} recovery actions this week. Need 2+ for capacity recovery.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Interactions */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">System Interactions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-300">Energy</span>
              </div>
              <div className="text-xs text-gray-400">
                Cap: {systems.energy.currentEnergyCap} / {systems.energy.baseEnergyCap}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-gray-300">XP Efficiency</span>
              </div>
              <div className="text-xs text-gray-400">
                {(systems.xp.efficiencyModifier * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-gray-300">Burnout Risk</span>
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {systems.burnout.riskLevel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

