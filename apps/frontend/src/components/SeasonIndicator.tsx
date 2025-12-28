import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Season } from '../types'
import { Sprout, Sun, Leaf, Snowflake, ArrowRight } from 'lucide-react'
import { seasonsApi } from '../services/api'
import { useGameStore } from '../store/useGameStore'
import { getSeasonDisplayName } from '../utils/enumDisplayNames'

const seasonConfig: Record<
  Season,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; description: string }
> = {
  [Season.SPRING]: {
    label: getSeasonDisplayName(Season.SPRING),
    icon: Sprout,
    color: 'from-green-500 to-emerald-600',
    description: 'Planning & Preparation',
  },
  [Season.SUMMER]: {
    label: getSeasonDisplayName(Season.SUMMER),
    icon: Sun,
    color: 'from-yellow-500 to-orange-600',
    description: 'Peak Output',
  },
  [Season.AUTUMN]: {
    label: getSeasonDisplayName(Season.AUTUMN),
    icon: Leaf,
    color: 'from-orange-500 to-red-600',
    description: 'Harvest & Consolidation',
  },
  [Season.WINTER]: {
    label: getSeasonDisplayName(Season.WINTER),
    icon: Snowflake,
    color: 'from-blue-500 to-cyan-600',
    description: 'Rest & Recovery',
  },
}

interface SeasonIndicatorProps {
  season: Season
  daysInSeason: number
  startDate: string
  onSeasonChange?: () => void
}

export default function SeasonIndicator({ season, daysInSeason, startDate, onSeasonChange }: SeasonIndicatorProps) {
  const { isDemo } = useGameStore()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  
  // Safety check: default to SPRING if season is invalid
  const validSeason = season && seasonConfig[season] ? season : Season.SPRING
  const config = seasonConfig[validSeason]
  const Icon = config.icon

  const seasonOrder: Season[] = [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER]
  const currentIndex = seasonOrder.indexOf(validSeason)
  const nextSeason = seasonOrder[(currentIndex + 1) % 4]

  const handleTransition = async () => {
    if (isDemo || isTransitioning) return

    if (!confirm(`Are you sure you want to transition to ${seasonConfig[nextSeason].label}?`)) {
      return
    }

    setIsTransitioning(true)
    try {
      await seasonsApi.transition(nextSeason, 'User-initiated transition')
      onSeasonChange?.()
      setShowTransition(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to transition season')
    } finally {
      setIsTransitioning(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-gradient-to-br ${config.color} rounded-xl p-6 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon className="w-12 h-12 text-white" />
          <div>
            <h3 className="text-2xl font-bold text-white">{config.label}</h3>
            <p className="text-white/80 text-sm">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right text-white">
            <p className="text-3xl font-bold">{daysInSeason}</p>
            <p className="text-white/80 text-sm">days in season</p>
            <p className="text-white/60 text-xs mt-1">
              Started {formatDistanceToNow(new Date(startDate), { addSuffix: true })}
            </p>
          </div>
          {!isDemo && daysInSeason >= 28 && (
            <div className="flex flex-col items-end gap-2">
              {!showTransition ? (
                <button
                  onClick={() => setShowTransition(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white text-sm font-medium backdrop-blur-sm"
                >
                  Transition
                </button>
              ) : (
                <div className="flex flex-col gap-2 items-end">
                  <p className="text-white/80 text-xs">Next: {seasonConfig[nextSeason].label}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTransition}
                      disabled={isTransitioning}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white text-sm font-medium backdrop-blur-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {isTransitioning ? 'Transitioning...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setShowTransition(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm font-medium backdrop-blur-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

