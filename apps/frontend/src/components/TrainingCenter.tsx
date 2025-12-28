import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Lock, CheckCircle2, PlayCircle, Trophy, TrendingUp } from 'lucide-react'
import { trainingApi } from '../services/api'
import { useGameStore } from '../store/useGameStore'
import { useToastStore } from '../store/useToastStore'
import { TaskStatus, TrainingModuleType } from '../types'
import TrainingTask from './TrainingTask'
import { logger } from '../lib/logger'

interface TrainingModule {
  id: string
  type: TrainingModuleType
  title: string
  description: string
  icon?: string
  order: number
  isUnlocked: boolean
  completedTasks: number
  totalTasks: number
  progress: number
  tasks: TrainingTaskData[]
}

interface TrainingTaskData {
  id: string
  title: string
  description: string
  instructions: string
  order: number
  xpReward: number
  categoryXP: any
  resourceReward?: any
  status: TaskStatus
  progress?: any
}

export default function TrainingCenter() {
  const { fetchDashboard } = useGameStore()
  const { addToast } = useToastStore()
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      setLoading(true)
      const data = await trainingApi.getModules()
      setModules(data.modules || [])
    } catch (error) {
      logger.error('Failed to load training modules:', error)
      addToast({
        type: 'error',
        title: 'Failed to Load Training',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (taskId: string, notes?: string) => {
    try {
      const result = await trainingApi.completeTask(taskId, notes)
      
      // Show XP gain notification
      const xpGained = result.xpGained
      if (xpGained) {
        const categoryGains = Object.entries(xpGained.category || {})
          .filter(([_, xp]: [string, unknown]) => typeof xp === 'number' && xp > 0)
          .map(([cat, xp]: [string, unknown]) => `${cat}: +${xp}`)
          .join(', ')

        addToast({
          type: 'success',
          title: `Task Completed! +${xpGained.overall} XP`,
          message: categoryGains || 'XP earned',
          duration: 6000,
        })
      }

      // Check for milestones
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

      await loadModules()
      await fetchDashboard()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Complete Task',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const getModuleIcon = (type: TrainingModuleType) => {
    switch (type) {
      case TrainingModuleType.EMERGENCY_FUND:
        return '💰'
      case TrainingModuleType.INCREASE_INCOME:
        return '📈'
      case TrainingModuleType.REDUCE_EXPENSES:
        return '✂️'
      case TrainingModuleType.AUTOMATE_SAVINGS:
        return '⚙️'
      case TrainingModuleType.MULTIPLE_INCOME_STREAMS:
        return '🔄'
      case TrainingModuleType.TRACK_EXPENSES:
        return '📊'
      case TrainingModuleType.AVOID_LIFESTYLE_INFLATION:
        return '🛡️'
      default:
        return '📚'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">Loading training modules...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Training Center</h2>
      </div>
      <p className="text-gray-400 mb-6">
        Complete training tasks to learn financial skills and earn XP. Each task builds your knowledge and improves your stats.
      </p>

      <div className="space-y-4">
        {modules.map((module) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`border rounded-lg overflow-hidden ${
              module.isUnlocked
                ? 'border-gray-700 bg-gray-800/50'
                : 'border-gray-800 bg-gray-900/50 opacity-60'
            }`}
          >
            {/* Module Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
              onClick={() => module.isUnlocked && setExpandedModule(expandedModule === module.id ? null : module.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {!module.isUnlocked ? (
                    <Lock className="w-6 h-6 text-gray-600" />
                  ) : (
                    <span className="text-2xl">{getModuleIcon(module.type)}</span>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {module.title}
                      {module.completedTasks === module.totalTasks && module.totalTasks > 0 && (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {module.completedTasks} / {module.totalTasks} tasks
                    </div>
                    <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                  {module.isUnlocked && (
                    <motion.div
                      animate={{ rotate: expandedModule === module.id ? 180 : 0 }}
                    >
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <AnimatePresence>
              {expandedModule === module.id && module.isUnlocked && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-700"
                >
                  <div className="p-4 space-y-3">
                    {module.tasks.map((task, index) => (
                      <TrainingTask
                        key={task.id}
                        task={task}
                        moduleType={module.type}
                        onComplete={handleTaskComplete}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

