import { useEffect, useState } from 'react'
import { sleepApi, energyApi, Sleep, EnergyStatus } from '../services/energyApi'
import { powerLawsApi, bibleLawsApi } from '../services/financeApi'
import { 
  Zap, 
  Moon, 
  Sun,
  BookOpen, 
  ChevronRight,
  Clock,
  Battery,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import SleepLogForm from '../components/SleepLogForm'
import EnergyStatusCard from '../components/EnergyStatusCard'
import DomainLawsView from '../components/DomainLawsView'
import HierarchyTreeView from '../components/knowledge/HierarchyTreeView'
import { MasterDomain } from '../types'

/**
 * MasterEnergy Page
 * 
 * Main interface for the Master Energy System featuring:
 * - Base Energy visualization (Sun/Moon based on day/night)
 * - Sleep logging and tracking
 * - Energy laws (Bible Laws & 48 Laws of Power)
 * - Capacity management
 * - Energy planning tools
 */
export default function MasterEnergy() {
  const [energyStatus, setEnergyStatus] = useState<EnergyStatus | null>(null)
  const [sleepHistory, setSleepHistory] = useState<Sleep[]>([])
  const [recentSleep, setRecentSleep] = useState<Sleep | null>(null)
  const [view, setView] = useState<'overview' | 'sleep' | 'laws' | 'concepts'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    
    // Refresh energy status every minute to show live burndown
    const interval = setInterval(() => {
      loadData()
    }, 60000) // Every minute
    
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statusRes, historyRes, recentRes] = await Promise.all([
        energyApi.getStatus().catch(() => null),
        sleepApi.getHistory().catch(() => ({ sleepLogs: [] })),
        sleepApi.getRecent().catch(() => ({ sleep: null })),
      ])
      setEnergyStatus(statusRes)
      setSleepHistory(historyRes.sleepLogs || [])
      setRecentSleep(recentRes.sleep || null)
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load Master Energy System data'
      logger.error('Error loading Master Energy System data', error instanceof Error ? error : new Error(errorMessage), {
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSleepLogged = async () => {
    await loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading Master Energy System...</div>
      </div>
    )
  }

  // Determine if it's day or night (simple approximation)
  const hour = new Date().getHours()
  const isDay = hour >= 6 && hour < 18

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${isDay ? 'bg-yellow-600/20' : 'bg-blue-600/20'}`}>
            {isDay ? (
              <Sun className="w-8 h-8 text-yellow-400" />
            ) : (
              <Moon className="w-8 h-8 text-blue-400" />
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold">Master Energy System</h1>
            <p className="text-gray-400 mt-1">
              {isDay ? 'The sun that powers your day' : 'The moon that guides your night'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'overview'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('sleep')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'sleep'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sleep & Rest
        </button>
        <button
          onClick={() => setView('laws')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'laws'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Energy Laws
        </button>
        <button
          onClick={() => setView('concepts')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'concepts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Universal Concepts
        </button>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <div className="space-y-8">
          {/* Energy Status Card */}
          {energyStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EnergyStatusCard 
                energyStatus={energyStatus}
                recentSleep={recentSleep}
                isDay={isDay}
              />
            </motion.div>
          )}

          {/* System Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setView('sleep')}
                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-blue-400 border border-transparent group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Moon className="w-6 h-6 text-blue-400" />
                  <h3 className="font-semibold group-hover:text-blue-400 transition-colors">Sleep & Rest</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-400 text-sm">
                  Log sleep to restore base energy. Sleep is the foundation that never leaves.
                </p>
              </button>
              <button
                onClick={() => setView('laws')}
                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-purple-400 border border-transparent group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                  <h3 className="font-semibold group-hover:text-purple-400 transition-colors">Energy Laws</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-400 text-sm">
                  Bible Laws & 48 Laws of Power applied to energy management, sleep, and vitality
                </p>
              </button>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Battery className="w-6 h-6 text-green-400" />
                  <h3 className="font-semibold">Base Energy</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  The foundation that powers everything. Restored through sleep, not temporary boosts.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg mt-1">
                  <Moon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sleep-Based Restoration</h3>
                  <p className="text-gray-400 text-sm">
                    Base energy only restores through sleep. Caffeine and food provide temporary boosts but don't restore base energy.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg mt-1">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Temporary Boosts</h3>
                  <p className="text-gray-400 text-sm">
                    Track caffeine, food, and supplements. These add temporary energy but don't restore base energy.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg mt-1">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Capacity Management</h3>
                  <p className="text-gray-400 text-sm">
                    Capacity modifies usable energy cap. High capacity = more energy. Low capacity = less energy.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-600/20 rounded-lg mt-1">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Energy Laws</h3>
                  <p className="text-gray-400 text-sm">
                    Learn from Bible Laws and 48 Laws of Power applied to energy management and sleep.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sleep View */}
      {view === 'sleep' && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SleepLogForm onSleepLogged={handleSleepLogged} />
          </motion.div>

          {/* Sleep History */}
          {sleepHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-4">Sleep History</h2>
              <div className="space-y-4">
                {sleepHistory.slice(0, 10).map((sleep) => (
                  <div
                    key={sleep.id}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">
                          {new Date(sleep.date).toLocaleDateString()}
                        </span>
                        {sleep.isOptimal && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                            Optimal
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">
                        {sleep.hoursSlept}h • Quality: {sleep.quality}/10
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Energy Restored: <span className="text-blue-400 font-semibold">+{sleep.energyRestored}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Laws View */}
      {view === 'laws' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DomainLawsView domain={MasterDomain.ENERGY} />
        </motion.div>
      )}

      {/* Universal Concepts View */}
      {view === 'concepts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HierarchyTreeView rootNodeId="constraints-of-reality" />
        </motion.div>
      )}
    </div>
  )
}

