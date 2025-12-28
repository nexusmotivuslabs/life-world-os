import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Calculator, Sparkles } from 'lucide-react'
import { ActivityType, Season } from '../types'
import { xpApi } from '../services/api'
import { calculateXP } from '../lib/xpCalculator'
import { useGameStore } from '../store/useGameStore'
import { useToastStore } from '../store/useToastStore'
import { getActivityTypeDisplayName } from '../utils/enumDisplayNames'
import { logger } from '../lib/logger'

const activitySchema = z.object({
  activityType: z.nativeEnum(ActivityType),
  description: z.string().optional(),
  customOverallXP: z.number().optional(),
  customCapacityXP: z.number().optional(),
  customEnginesXP: z.number().optional(),
  customOxygenXP: z.number().optional(),
  customMeaningXP: z.number().optional(),
  customOptionalityXP: z.number().optional(),
  oxygenChange: z.number().optional(),
  waterChange: z.number().min(-100).max(100).optional(),
  goldChange: z.number().optional(),
  armorChange: z.number().min(-100).max(100).optional(),
  keysChange: z.number().optional(),
})

type ActivityFormData = z.infer<typeof activitySchema>

export default function ActivityXPCalculator() {
  const { dashboard, fetchDashboard } = useGameStore()
  const { addToast } = useToastStore()
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
  })

  const activityType = watch('activityType')
  const customOverallXP = watch('customOverallXP')
  const customCapacityXP = watch('customCapacityXP')
  const currentSeason = dashboard?.season.season || Season.SPRING

  const customEnginesXP = watch('customEnginesXP')
  const customOxygenXP = watch('customOxygenXP')
  const customMeaningXP = watch('customMeaningXP')
  const customOptionalityXP = watch('customOptionalityXP')

  // Step 8: Preview calculation - UI-only, does not affect game state
  // Actual XP is computed by backend with all mechanics (Capacity modifiers, burnout penalties, etc.)
  // This preview is only for UI display, actual submission uses backend-calculated values
  useEffect(() => {
    if (!activityType) {
      setPreview(null)
      return
    }

    const customXP = customOverallXP || customCapacityXP
      ? {
          overall: customOverallXP,
          category: {
            capacity: customCapacityXP,
            engines: customEnginesXP,
            oxygen: customOxygenXP,
            meaning: customMeaningXP,
            optionality: customOptionalityXP,
          },
        }
      : undefined

    const previewXP = calculateXP(activityType, currentSeason, customXP)
    setPreview(previewXP)
  }, [activityType, customOverallXP, customCapacityXP, customEnginesXP, customOxygenXP, customMeaningXP, customOptionalityXP, currentSeason])

  const onSubmit = async (data: ActivityFormData) => {
    setLoading(true)
    try {
      const customXP = data.customOverallXP || data.customCapacityXP
        ? {
            overall: data.customOverallXP,
            category: {
              capacity: data.customCapacityXP,
              engines: data.customEnginesXP,
              oxygen: data.customOxygenXP,
              meaning: data.customMeaningXP,
              optionality: data.customOptionalityXP,
            },
          }
        : undefined

      const resourceChanges = {
        oxygen: data.oxygenChange,
        water: data.waterChange,
        gold: data.goldChange,
        armor: data.armorChange,
        keys: data.keysChange,
      }

      const result = await xpApi.recordActivity({
        activityType: data.activityType,
        description: data.description,
        customXP,
        resourceChanges: Object.values(resourceChanges).some((v) => v !== undefined)
          ? resourceChanges
          : undefined,
      })

      // Show success notification with XP gains
      const xpGained = result.xpGained || preview
      if (xpGained) {
        const categoryGains = Object.entries(xpGained.categoryXP || {})
          .filter(([_, xp]: [string, unknown]) => typeof xp === 'number' && xp > 0)
          .map(([cat, xp]: [string, unknown]) => `${cat}: +${xp}`)
          .join(', ')

        addToast({
          type: 'success',
          title: `Activity Recorded! +${xpGained.overallXP} XP`,
          message: categoryGains || 'XP earned',
          duration: 6000,
        })

        // Check for new milestones
        if (result.milestones?.newMilestones?.length > 0) {
          setTimeout(() => {
            result.milestones.newMilestones.forEach((milestone: string) => {
              addToast({
                type: 'achievement',
                title: 'Achievement Unlocked!',
                message: milestone.replace(/_/g, ' '),
                duration: 8000,
              })
            })
          }, 1000)
        }
      }

      reset()
      setPreview(null)
      fetchDashboard()
    } catch (error) {
      logger.error('Failed to record activity:', error)
      addToast({
        type: 'error',
        title: 'Failed to Record Activity',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold">Record Activity</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Activity Type
          </label>
          <select
            {...register('activityType')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select activity...</option>
            {Object.values(ActivityType).map((type) => (
              <option key={type} value={type}>
                {getActivityTypeDisplayName(type)}
              </option>
            ))}
          </select>
          {errors.activityType && (
            <p className="text-red-400 text-sm mt-1">{errors.activityType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (optional)
          </label>
          <input
            type="text"
            {...register('description')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-900/20 border border-blue-500 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-blue-400">XP Preview</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Overall XP:</span>
                <span className="text-yellow-400 font-bold">+{preview.overallXP}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-green-400 ml-2">+{preview.categoryXP.capacity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Engines:</span>
                  <span className="text-blue-400 ml-2">+{preview.categoryXP.engines}</span>
                </div>
                <div>
                  <span className="text-gray-400">Oxygen:</span>
                  <span className="text-cyan-400 ml-2">+{preview.categoryXP.oxygen}</span>
                </div>
                <div>
                  <span className="text-gray-400">Meaning:</span>
                  <span className="text-purple-400 ml-2">+{preview.categoryXP.meaning}</span>
                </div>
                <div>
                  <span className="text-gray-400">Optionality:</span>
                  <span className="text-orange-400 ml-2">+{preview.categoryXP.optionality}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-700">
                <span className="text-gray-400">Season Multiplier:</span>
                <span className="text-blue-300 ml-2">×{preview.seasonMultiplier}</span>
              </div>
            </div>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading || !activityType}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Recording...' : 'Record Activity'}
        </button>
      </form>
    </motion.div>
  )
}

