import { useEffect, useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { awarenessApi, AwarenessLayer } from '../services/awarenessApi'
import { 
  BookOpen, 
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Shield,
  Eye,
  Sparkles,
  Layers
} from 'lucide-react'
import { motion } from 'framer-motion'
import CloudGauge from '../components/CloudGauge'
import MasterSystemLayout from '../components/MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import { MasterDomain } from '../types'

/**
 * MasterMeaning Page
 * 
 * Main interface for the Meaning System featuring:
 * - Meaning State (0-100 stat)
 * - Meaning Decay & Stability
 * - Direction & Alignment
 * - Awareness Layers (nested interpretation context)
 * 
 * Uses MasterSystemLayout for consistent four-feature structure:
 * Overview, Domain Teams, Expert Agents, Universal Concepts.
 * Awareness Layers are read-only interpretation layers, not executable systems.
 * They reframe experience but never alter mechanics.
 */
export default function MasterMeaning() {
  const { dashboard, fetchDashboard } = useGameStore()
  const [subView, setSubView] = useState<'overview' | 'decay' | 'awareness'>('overview')
  const [loading, setLoading] = useState(true)
  const [awarenessLayers, setAwarenessLayers] = useState<AwarenessLayer[]>([])

  const { teams, agents } = useSystemData({
    cacheKeyPrefix: 'master-meaning',
    systemId: MasterDomain.MEANING,
    fetchProducts: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await fetchDashboard()
      
      // Load awareness layers
      try {
        const response = await awarenessApi.getLayers()
        const sorted = response.layers.sort((a, b) => a.orderIndex - b.orderIndex)
        setAwarenessLayers(sorted)
      } catch (err) {
        console.error('Failed to load awareness layers', err)
      }
    } catch (error) {
      console.error('Error loading Meaning System data', error)
    } finally {
      setLoading(false)
    }
  }

  const meaningStrength = dashboard?.clouds?.meaning ?? 50
  const meaningXP = dashboard?.xp?.category?.meaning ?? 0
  const meaningLevel = dashboard?.xp?.categoryLevels?.meaning ?? 1

  // Calculate Meaning band
  let meaningBand: 'critical' | 'low' | 'medium' | 'high' | 'optimal'
  if (meaningStrength <= 20) {
    meaningBand = 'critical'
  } else if (meaningStrength <= 30) {
    meaningBand = 'low'
  } else if (meaningStrength <= 60) {
    meaningBand = 'medium'
  } else if (meaningStrength <= 80) {
    meaningBand = 'high'
  } else {
    meaningBand = 'optimal'
  }

  const getMeaningColor = () => {
    switch (meaningBand) {
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

  // Group awareness layers by canonical categories
  const rootLayers = awarenessLayers.filter(l => l.category === 'ROOT' || l.isRoot)
  const shadowLayers = awarenessLayers.filter(l => l.category === 'EXAMINE')
  const patternLayers = awarenessLayers.filter(l => l.category === 'REFUTE')

  const totalLoading = loading && !dashboard

  return (
    <MasterSystemLayout
      title="Meaning System"
      description="Purpose, values alignment, and spiritual/psychological resilience"
      mantra="Purpose protects against decay."
      icon={Sparkles}
      color="text-purple-400"
      bgColor="bg-purple-600/20"
      teams={teams}
      agents={agents}
      loading={totalLoading}
      rootNodeId="systems-node-expression_tier-meaning-universal-concept"
      systemId="meaning"
      renderOverview={({ setView: setParentView }) => (
        <div className="space-y-8">
          {/* Sub-navigation for Meaning-specific views */}
          <div className="flex gap-3">
            <button
              onClick={() => setSubView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                subView === 'overview'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSubView('decay')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                subView === 'decay'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              Decay & Stability
            </button>
            <button
              onClick={() => setSubView('awareness')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                subView === 'awareness'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              Awareness Layers
            </button>
          </div>

          {/* Overview Sub-View */}
          {subView === 'overview' && (
            <>
              {/* Meaning State Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className={`w-8 h-8 ${getMeaningColor()}`} />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Meaning State</h2>
                      <p className="text-sm text-gray-400">
                        {meaningBand.charAt(0).toUpperCase() + meaningBand.slice(1)} ({meaningStrength}/100)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getMeaningColor()}`}>{meaningStrength}</div>
                    <div className="text-sm text-gray-400">/ 100</div>
                  </div>
                </div>

                {/* Meaning Cloud Gauge */}
                <div className="mb-6">
                  <CloudGauge type="meaning" strength={meaningStrength} />
                </div>

                {/* Meaning Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-300">Meaning Level</span>
                    <span className={`text-lg font-bold ${getMeaningColor()}`}>
                      {meaningStrength}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-6 overflow-hidden border-2 border-gray-700">
                    <motion.div
                      className={`h-full rounded-full ${
                        meaningBand === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                        meaningBand === 'low' ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                        meaningBand === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                        meaningBand === 'high' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                        'bg-gradient-to-r from-blue-500 to-blue-400'
                      }`}
                      style={{ width: `${meaningStrength}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${meaningStrength}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>

                {/* Meaning XP Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">Meaning XP</div>
                    <div className="text-2xl font-bold text-purple-400">{meaningXP}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">Meaning Level</div>
                    <div className="text-2xl font-bold text-purple-400">{meaningLevel}</div>
                  </div>
                </div>
              </motion.div>

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
                    onClick={() => setSubView('decay')}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-purple-400 border border-transparent group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingDown className="w-6 h-6 text-purple-400" />
                      <h3 className="font-semibold group-hover:text-purple-400 transition-colors">Decay & Stability</h3>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Meaning decays when actions drift from values. High Meaning provides decay protection.
                    </p>
                  </button>
                  <button
                    onClick={() => setSubView('awareness')}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-blue-400 border border-transparent group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Layers className="w-6 h-6 text-blue-400" />
                      <h3 className="font-semibold group-hover:text-blue-400 transition-colors">Awareness Layers</h3>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Read-only interpretation context. Reframes experience but never alters mechanics.
                    </p>
                  </button>
                  <button
                    onClick={() => setParentView('concepts')}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-green-400 border border-transparent group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-6 h-6 text-green-400" />
                      <h3 className="font-semibold group-hover:text-green-400 transition-colors">Universal Concepts</h3>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Laws, principles, and frameworks that govern the Meaning system.
                    </p>
                  </button>
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
                    <div className="p-2 bg-purple-600/20 rounded-lg mt-1">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Decay Protection</h3>
                      <p className="text-gray-400 text-sm">
                        High Meaning reduces decay rates. Low Meaning accelerates decay. Meaning cannot be faked.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-600/20 rounded-lg mt-1">
                      <AlertTriangle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Burnout Resistance</h3>
                      <p className="text-gray-400 text-sm">
                        High Meaning protects against Burnout failure state. Provides psychological resilience.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg mt-1">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Values Alignment</h3>
                      <p className="text-gray-400 text-sm">
                        Meaning requires genuine values alignment. Actions must match stated values. Inauthentic actions reduce Meaning.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-600/20 rounded-lg mt-1">
                      <Eye className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Awareness Context</h3>
                      <p className="text-gray-400 text-sm">
                        Awareness Layers provide interpretation context. They reframe experience but never alter mechanics or grant bonuses.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Decay & Stability Sub-View */}
          {subView === 'decay' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-4">Meaning Decay & Stability</h2>
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-purple-400">Weekly Decay</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Meaning decays -1 point per week if value drift is detected.
                  </p>
                  <p className="text-xs text-gray-500">
                    Value drift: Actions consistently misaligned with stated values.
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-orange-400">Decay Floor</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Meaning cannot decay below 20 (floor value).
                  </p>
                  <p className="text-xs text-gray-500">
                    Critical threshold prevents complete meaning collapse.
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-red-400">Accelerated Decay</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Low Meaning (&lt;30) increases decay rate.
                  </p>
                  <p className="text-xs text-gray-500">
                    Critical state requires immediate value alignment.
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-green-400">Decay Protection</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    High Meaning (61-100) reduces overall decay rates.
                  </p>
                  <p className="text-xs text-gray-500">
                    Provides stability through alignment. Protects other stats from degradation.
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-yellow-400">Over-Optimization Penalty</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Excessive Saving reduces Meaning (-2 points weekly).
                  </p>
                  <p className="text-xs text-gray-500">
                    Hoarding is penalized. Balance required between resources and Meaning.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Awareness Layers Sub-View */}
          {subView === 'awareness' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold">Awareness Layers</h2>
                </div>
                <p className="text-gray-400">
                  Read-only interpretation context. Awareness Layers reframe experience but never alter mechanics, grant XP, or bypass penalties.
                </p>
                <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    <strong>Important:</strong> Awareness is not a system, resource, stat, or optimization lever. It provides worldview lenses for interpreting Meaning, not for changing outcomes.
                  </p>
                </div>
              </div>

              {/* Canonical Awareness Layers */}
              <div className="space-y-6">
                {/* Root Worldview */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">1. Root Worldview (Primary)</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Answers "What does suffering mean?" Only one primary root active. Root worldview influences Meaning interpretation only.
                  </p>
                  {rootLayers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rootLayers.map((layer) => (
                        <div
                          key={layer.id}
                          className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            <h4 className="font-semibold text-blue-400">{layer.title}</h4>
                            {layer.isRoot && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                ROOT
                              </span>
                            )}
                          </div>
                          {layer.description && (
                            <p className="text-gray-300 text-sm">{layer.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No root worldview layers available</p>
                  )}
                </div>

                {/* Shadow Awareness */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-yellow-400">2. Shadow Awareness (Contrast)</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Shows failure of meaning when alignment collapses. Shadow layers are observational, not selectable goals. Used to detect Meaning instability patterns.
                  </p>
                  {shadowLayers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shadowLayers.map((layer) => (
                        <div
                          key={layer.id}
                          className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-5 h-5 text-yellow-400" />
                            <h4 className="font-semibold text-yellow-400">{layer.title}</h4>
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                              EXAMINE
                            </span>
                          </div>
                          {layer.description && (
                            <p className="text-gray-300 text-sm">{layer.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No shadow awareness layers available</p>
                  )}
                </div>

                {/* Pattern Awareness */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-400">3. Pattern Awareness (Meta)</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Highlights repeated behavioural cycles. Pattern awareness is reflective only. No rewards, no penalties, no stats.
                  </p>
                  {patternLayers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patternLayers.map((layer) => (
                        <div
                          key={layer.id}
                          className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-5 h-5 text-red-400" />
                            <h4 className="font-semibold text-red-400">{layer.title}</h4>
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                              REFUTE
                            </span>
                          </div>
                          {layer.description && (
                            <p className="text-gray-300 text-sm">{layer.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No pattern awareness layers available</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    />
  )
}
