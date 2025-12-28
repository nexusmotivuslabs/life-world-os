import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, BookOpen, DollarSign, Heart, Zap } from 'lucide-react'
import { ActivityType } from '../types'
import { useGameStore } from '../store/useGameStore'
import { useToastStore } from '../store/useToastStore'
import { xpApi } from '../services/api'

interface QuickAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  activityType: ActivityType
  description?: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    label: 'Work Project',
    icon: Briefcase,
    activityType: ActivityType.WORK_PROJECT,
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    label: 'Exercise',
    icon: Heart,
    activityType: ActivityType.EXERCISE,
    color: 'bg-red-600 hover:bg-red-700',
  },
  {
    label: 'Learning',
    icon: BookOpen,
    activityType: ActivityType.LEARNING,
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    label: 'Save Money',
    icon: DollarSign,
    activityType: ActivityType.SAVE_EXPENSES,
    color: 'bg-green-600 hover:bg-green-700',
  },
  {
    label: 'Custom',
    icon: Zap,
    activityType: ActivityType.CUSTOM,
    color: 'bg-yellow-600 hover:bg-yellow-700',
  },
]

export default function QuickActions() {
  const { isDemo, dashboard, fetchDashboard } = useGameStore()
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState<string | null>(null)

  const handleQuickAction = async (action: QuickAction) => {
    if (isDemo) {
      addToast({
        type: 'info',
        title: 'Sign Up Required',
        message: 'Please sign up to record activities',
      })
      return
    }

    setLoading(action.activityType)
    try {
      const result = await xpApi.recordActivity({
        activityType: action.activityType,
        description: action.description || `${action.label} completed`,
      })

      const xpGained = result.xpGained
      if (xpGained) {
        addToast({
          type: 'success',
          title: `${action.label} Recorded!`,
          message: `+${xpGained.overallXP} XP earned`,
          duration: 5000,
        })

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

      fetchDashboard()
    } catch (error: any) {
      // Handle insufficient energy error
      if (error?.response?.status === 400 && error?.response?.data?.error === 'Insufficient energy') {
        const data = error.response.data
        addToast({
          type: 'error',
          title: 'Insufficient Energy',
          message: `You need ${data.requiredEnergy} energy but only have ${data.currentEnergy} usable energy. Energy resets daily.`,
          duration: 8000,
        })
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Record',
          message: error instanceof Error ? error.message : 'Please try again',
        })
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          const isLoading = loading === action.activityType

          return (
            <motion.button
              key={action.activityType}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading || isDemo}
              className={`${action.color} rounded-lg p-4 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{action.label}</span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </motion.button>
          )
        })}
      </div>
      {isDemo && (
        <p className="text-gray-400 text-sm text-center mt-4">
          Sign up to use quick actions
        </p>
      )}
    </div>
  )
}

