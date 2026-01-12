import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock, PlayCircle, Sparkles, X } from 'lucide-react'
import { TaskStatus, TrainingModuleType } from '../types'

interface TrainingTaskProps {
  task: {
    id: string
    title: string
    description: string
    instructions: string
    order: number
    xpReward: number
    categoryXP: any
    resourceReward?: any
    status: TaskStatus
  }
  moduleType: TrainingModuleType
  onComplete: (taskId: string, notes?: string) => Promise<void>
}

export default function TrainingTask({ task, moduleType, onComplete }: TrainingTaskProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [notes, setNotes] = useState('')

  const handleComplete = async () => {
    if (task.status !== TaskStatus.AVAILABLE && task.status !== TaskStatus.IN_PROGRESS) {
      return
    }

    setCompleting(true)
    try {
      await onComplete(task.id, notes || undefined)
      setShowDetails(false)
      setNotes('')
    } catch (error) {
      // Error handled by parent
    } finally {
      setCompleting(false)
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case TaskStatus.LOCKED:
        return <Lock className="w-5 h-5 text-gray-600" />
      case TaskStatus.AVAILABLE:
      case TaskStatus.IN_PROGRESS:
        return <PlayCircle className="w-5 h-5 text-blue-400" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return 'border-green-500/50 bg-green-500/10'
      case TaskStatus.LOCKED:
        return 'border-gray-700 bg-gray-900/50 opacity-60'
      case TaskStatus.AVAILABLE:
        return 'border-blue-500/50 bg-blue-500/10'
      case TaskStatus.IN_PROGRESS:
        return 'border-yellow-500/50 bg-yellow-500/10'
      default:
        return 'border-gray-700'
    }
  }

  const categoryXP = task.categoryXP || {}
  const hasCategoryXP = Object.values(categoryXP).some((xp: any) => xp > 0)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border rounded-lg p-4 ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{task.title}</h4>
              {task.status === TaskStatus.COMPLETED && (
                <span className="text-xs text-green-400 font-medium">Completed</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-2">{task.description}</p>
            
            {/* XP Preview */}
            {task.status !== TaskStatus.LOCKED && (
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">+{task.xpReward} XP</span>
                </div>
                {hasCategoryXP && (
                  <div className="flex items-center gap-2">
                    {Object.entries(categoryXP).map(([cat, xp]: [string, any]) => {
                      if (xp <= 0) return null
                      const colors: Record<string, string> = {
                        capacity: 'text-green-400',
                        engines: 'text-blue-400',
                        oxygen: 'text-cyan-400',
                        meaning: 'text-purple-400',
                        optionality: 'text-orange-400',
                      }
                      return (
                        <span key={cat} className={colors[cat] || 'text-gray-400'}>
                          {cat}: +{xp}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {task.status === TaskStatus.AVAILABLE || task.status === TaskStatus.IN_PROGRESS ? (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                {showDetails ? 'Hide Details' : 'View Instructions'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (task.status === TaskStatus.AVAILABLE || task.status === TaskStatus.IN_PROGRESS) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-700"
        >
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-sm mb-2">Instructions:</h5>
              <p className="text-sm text-gray-300 whitespace-pre-line">{task.instructions}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about completing this task..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDetails(false)
                  setNotes('')
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {completing ? (
                  'Completing...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}





