import { Sun, Moon, Zap, Battery, Clock, TrendingDown } from 'lucide-react'
import { EnergyStatus, Sleep } from '../services/energyApi'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface EnergyStatusCardProps {
  energyStatus: EnergyStatus
  recentSleep: Sleep | null
  isDay: boolean
}

export default function EnergyStatusCard({ 
  energyStatus, 
  recentSleep,
  isDay 
}: EnergyStatusCardProps) {
  // Reserved for future live time updates
  // const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update time every minute to show live burndown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])
  
  const basePercentage = energyStatus.baseEnergyPercentage
  const showSun = isDay
  const showMoon = !isDay
  
  // Calculate live energy decay if burndown info is available
  const burndown = energyStatus.burndown
  const restoredAt = energyStatus.restoredAt ? new Date(energyStatus.restoredAt) : null

  // Moon phase based on base energy
  const getMoonPhase = () => {
    if (basePercentage === 0) return 'new'
    if (basePercentage < 25) return 'waxing-crescent'
    if (basePercentage < 50) return 'first-quarter'
    if (basePercentage < 75) return 'waxing-gibbous'
    return 'full'
  }

  const moonPhase = getMoonPhase()
  const glowIntensity = basePercentage / 100
  const sunGlow = `rgba(251, 191, 36, ${0.2 + glowIntensity * 0.3})`
  const moonGlow = `rgba(147, 197, 253, ${0.15 + glowIntensity * 0.25})`

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sky gradient overlay */}
      <AnimatePresence mode="wait">
        {showSun ? (
          <motion.div
            key="day-sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-blue-400/15 via-transparent to-orange-300/10"
          />
        ) : (
          <motion.div
            key="night-sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-slate-900"
          />
        )}
      </AnimatePresence>

      {/* Stars (only at night) */}
      {showMoon && (
        <div className="absolute inset-0 opacity-15">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {showSun ? (
              <Sun className="w-8 h-8 text-yellow-400" />
            ) : (
              <Moon className="w-8 h-8 text-blue-400" />
            )}
            <div>
              <h3 className="text-2xl font-bold text-white">Base Energy</h3>
              <p className="text-sm text-gray-400">
                {showSun ? 'Daytime (solar cycle)' : 'Nighttime (lunar cycle)'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">{energyStatus.baseEnergy}</div>
            <div className="text-sm text-gray-400">/ {energyStatus.capacityCap}</div>
          </div>
        </div>

        {/* Celestial Body */}
        <div className="relative flex items-center justify-center mb-8" style={{ height: '280px' }}>
          {/* Glow effect */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${showSun ? sunGlow : moonGlow} 0%, transparent 70%)`,
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

          {/* Sun or Moon */}
          <AnimatePresence mode="wait">
            {showSun ? (
              <motion.div
                key="sun"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative z-20"
              >
                <div 
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500"
                  style={{
                    boxShadow: `0 0 60px ${sunGlow}`,
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative z-20"
              >
                <div 
                  className="w-32 h-32 rounded-full relative"
                  style={{
                    boxShadow: `0 0 60px ${moonGlow}`,
                  }}
                >
                  {moonPhase === 'new' && (
                    <div className="w-full h-full rounded-full bg-gray-800 border-4 border-gray-600" />
                  )}
                  {moonPhase === 'waxing-crescent' && (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-gray-800 via-blue-400 to-blue-300 border-4 border-blue-400" 
                      style={{ clipPath: 'inset(0 50% 0 0)' }} />
                  )}
                  {moonPhase === 'first-quarter' && (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-gray-800 via-blue-400 to-blue-300 border-4 border-blue-400" 
                      style={{ clipPath: 'inset(0 25% 0 0)' }} />
                  )}
                  {moonPhase === 'waxing-gibbous' && (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-gray-800 via-blue-400 to-blue-300 border-4 border-blue-400" 
                      style={{ clipPath: 'inset(0 10% 0 0)' }} />
                  )}
                  {moonPhase === 'full' && (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 border-4 border-blue-300" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Temporary boosts indicator */}
          {energyStatus.temporaryBoosts.length > 0 && (
            <motion.div
              className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-lg border-2 border-yellow-400/50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-sm font-bold text-yellow-300">
                  +{energyStatus.temporaryBoosts.reduce((sum, b) => sum + b.amount, 0)}
                </div>
                <div className="text-xs text-gray-400">Temporary</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Base Energy Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-300">Base Energy Level</span>
            <span className="text-lg font-bold text-white">
              {basePercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-6 overflow-hidden border-2 border-gray-700">
            <motion.div
              className={`h-full rounded-full ${
                showSun 
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-300'
                  : 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300'
              }`}
              style={{ width: `${basePercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${basePercentage}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-3">
          {!recentSleep && (
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
              {showSun ? (
                <Sun className="w-6 h-6 text-red-400" />
              ) : (
                <Moon className="w-6 h-6 text-red-400" />
              )}
              <div>
                <div className="text-sm font-semibold text-red-300">No Sleep Logged</div>
                <div className="text-xs text-red-400">
                  Base energy not restored. Sleep is required to restore base energy.
                </div>
              </div>
            </div>
          )}

          {recentSleep && (
            <div className="flex items-center gap-3 p-4 bg-blue-900/30 border-2 border-blue-500/50 rounded-xl">
              {showSun ? (
                <Sun className="w-6 h-6 text-blue-400" />
              ) : (
                <Moon className="w-6 h-6 text-blue-400" />
              )}
              <div>
                <div className="text-sm font-semibold text-blue-300">Sleep Restored Energy</div>
                <div className="text-xs text-blue-400">
                  {recentSleep.hoursSlept}h sleep, quality {recentSleep.quality}/10 → {recentSleep.energyRestored} base energy restored
                </div>
              </div>
            </div>
          )}

          {energyStatus.temporaryBoosts.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-sm font-semibold text-yellow-300">Temporary Boost Active</div>
                <div className="text-xs text-yellow-400">
                  +{energyStatus.temporaryBoosts.reduce((sum, b) => sum + b.amount, 0)} temporary energy. This doesn't restore base energy - sleep is required.
                </div>
              </div>
            </div>
          )}

          {energyStatus.isInBurnout && (
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
              <Battery className="w-6 h-6 text-red-400" />
              <div>
                <div className="text-sm font-semibold text-red-300">Burnout Detected</div>
                <div className="text-xs text-red-400">
                  Energy cap reduced to 40. Focus on rest and recovery.
                </div>
              </div>
            </div>
          )}

          {/* Live Burndown Information */}
          {burndown && restoredAt && (
            <div className="flex items-center gap-3 p-4 bg-orange-900/30 border-2 border-orange-500/50 rounded-xl">
              <TrendingDown className="w-6 h-6 text-orange-400" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-orange-300">Live Energy Burndown</div>
                <div className="text-xs text-orange-400 space-y-1 mt-1">
                  <div className="flex items-center justify-between">
                    <span>Decay Rate:</span>
                    <span className="font-semibold">{burndown.decayRatePerHour} energy/hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time Elapsed:</span>
                    <span className="font-semibold">{burndown.hoursElapsed.toFixed(1)} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Energy Decayed:</span>
                    <span className="font-semibold">-{burndown.energyDecayed}</span>
                  </div>
                  {burndown.hoursUntilDepletion !== null && burndown.hoursUntilDepletion > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Time Until Depletion:</span>
                      <span className="font-semibold">
                        {burndown.hoursUntilDepletion < 24
                          ? `${burndown.hoursUntilDepletion.toFixed(1)} hours`
                          : `${(burndown.hoursUntilDepletion / 24).toFixed(1)} days`}
                      </span>
                    </div>
                  )}
                  {burndown.hoursUntilDepletion === null && (
                    <div className="flex items-center justify-between text-red-400">
                      <span>Status:</span>
                      <span className="font-semibold">Depleted</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Restoration Time */}
          {restoredAt && (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="text-xs text-gray-400">
                <span className="font-semibold">Restored:</span>{' '}
                {restoredAt.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

