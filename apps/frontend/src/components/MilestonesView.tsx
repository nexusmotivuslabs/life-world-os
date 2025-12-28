import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Key, CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { progressionApi } from '../services/api'
import { useGameStore } from '../store/useGameStore'
import { useToastStore } from '../store/useToastStore'

interface Milestone {
  id: string
  type: string
  unlockedAt: string
  keysUnlocked: number
}

const milestoneLabels: Record<string, string> = {
  THREE_MONTHS_EXPENSES: '3 Months Expenses Covered',
  SIX_MONTHS_EXPENSES: '6 Months Expenses Covered',
  ONE_YEAR_EXPENSES: '1 Year Expenses Covered',
  FIRST_INCOME_ASSET: 'First Income-Producing Asset',
  ABILITY_TO_SAY_NO: 'Ability to Say No',
  SURVIVE_LOW_INCOME: 'Survived Low Income Period',
  REDUCED_FRAGILITY: 'Reduced Fragility',
}

export default function MilestonesView() {
  const { isDemo, fetchDashboard } = useGameStore()
  const { addToast } = useToastStore()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const [celebrating, setCelebrating] = useState<string | null>(null)

  useEffect(() => {
    if (!isDemo) {
      loadMilestones()
    }
  }, [isDemo])

  const loadMilestones = async () => {
    setLoading(true)
    try {
      const data = await progressionApi.getMilestones()
      setMilestones(data)
    } catch (error) {
      console.error('Failed to load milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckMilestones = async () => {
    if (isDemo) return

    setLoading(true)
    try {
      const result = await progressionApi.checkMilestones()
      if (result.newMilestones.length > 0) {
        // Celebrate each new milestone
        result.newMilestones.forEach((milestoneType, index) => {
          setTimeout(() => {
            setCelebrating(milestoneType)
            addToast({
              type: 'achievement',
              title: '🎉 Achievement Unlocked!',
              message: milestoneLabels[milestoneType] || milestoneType.replace(/_/g, ' '),
              duration: 8000,
            })
            setTimeout(() => setCelebrating(null), 2000)
          }, index * 500)
        })

        // Show keys unlocked
        if (result.unlockedKeys > 0) {
          setTimeout(() => {
            addToast({
              type: 'success',
              title: `+${result.unlockedKeys} Keys Unlocked!`,
              message: 'New options are now available',
              duration: 6000,
            })
          }, result.newMilestones.length * 500)
        }

        loadMilestones()
        fetchDashboard()
      } else {
        addToast({
          type: 'info',
          title: 'No New Achievements',
          message: 'Keep progressing to unlock more!',
          duration: 3000,
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Check Milestones',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  if (isDemo) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Milestones
        </h3>
        <p className="text-gray-400 text-center py-8">Sign up to track your milestones</p>
      </div>
    )
  }

  const allMilestoneTypes = Object.keys(milestoneLabels)
  const unlockedTypes = new Set(milestones.map((m) => m.type))

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Milestones
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCheckMilestones}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Now'}
          </button>
          <button
            onClick={loadMilestones}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-white text-sm font-medium disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && milestones.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {allMilestoneTypes.map((type) => {
            const milestone = milestones.find((m) => m.type === type)
            const isUnlocked = unlockedTypes.has(type)

            const isCelebrating = celebrating === type

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isCelebrating ? 1.05 : 1,
                }}
                transition={{
                  scale: { duration: 0.2, repeat: isCelebrating ? Infinity : 0, repeatType: 'reverse' },
                }}
                className={`bg-gray-700 rounded-lg p-4 border ${
                  isUnlocked ? 'border-green-500/50' : 'border-gray-600'
                } ${isCelebrating ? 'ring-4 ring-yellow-400' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isUnlocked ? (
                      <motion.div
                        animate={isCelebrating ? { rotate: [0, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {isCelebrating ? (
                          <Sparkles className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        )}
                      </motion.div>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-500" />
                    )}
                    <div>
                      <p className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                        {milestoneLabels[type]}
                      </p>
                      {milestone && (
                        <p className="text-xs text-gray-500 mt-1">
                          Unlocked {new Date(milestone.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {milestone && milestone.keysUnlocked > 0 && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Key className="w-4 h-4" />
                      <span className="font-medium">+{milestone.keysUnlocked}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

