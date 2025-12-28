import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { History, TrendingUp } from 'lucide-react'
import { xpApi } from '../services/api'
import { useGameStore } from '../store/useGameStore'

interface ActivityLog {
  id: string
  activityType: string
  description?: string | null
  overallXPGained: number
  categoryXPGain: {
    capacity: number
    engines: number
    oxygen: number
    meaning: number
    optionality: number
  }
  timestamp: string
}

export default function ActivityHistory() {
  const { isDemo } = useGameStore()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isDemo) {
      loadHistory()
    }
  }, [isDemo])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await xpApi.getHistory(50)
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activity history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isDemo) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Activity History
        </h3>
        <p className="text-gray-400 text-center py-8">Sign up to view your activity history</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5" />
          Activity History
        </h3>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No activities yet</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-white">{activity.activityType.replace(/_/g, ' ')}</span>
                  </div>
                  {activity.description && (
                    <p className="text-gray-300 text-sm mb-2">{activity.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Overall XP: </span>
                      <span className="text-white font-medium">+{activity.overallXPGained}</span>
                    </div>
                    {Object.entries(activity.categoryXPGain)
                      .filter(([_, xp]) => xp > 0)
                      .map(([category, xp]) => (
                        <div key={category}>
                          <span className="text-gray-500 capitalize">{category}: </span>
                          <span className="text-white font-medium">+{xp}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400 ml-4">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

