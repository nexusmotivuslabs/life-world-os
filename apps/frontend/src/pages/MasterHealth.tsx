import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { healthApi, HealthStatus } from '../services/healthApi'
import type { Team } from '../services/financeApi'
import { getMasterProductRoute } from '../config/routes'
import { MasterDomain, SystemId } from '../types'
import {
  HeartPulse,
  Activity,
  Users,
  Brain,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Zap,
  Shield,
  RefreshCw,
  Package,
  Key,
} from 'lucide-react'
import { motion } from 'framer-motion'
import HealthStatusCard from '../components/HealthStatusCard'
import MasterSystemLayout from '../components/MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import { useDataFetch } from '../hooks/useDataFetch'
import { FeatureErrorBoundary } from '../components/ErrorBoundary'
import { HEALTH_AGENT_TYPES, HEALTH_TEAM_DOMAINS } from '../config/systemConfig'

/**
 * MasterHealth Page
 *
 * Main interface for the Health/Capacity System featuring:
 * - Capacity state visualization
 * - Recovery tracking
 * - System interactions (Energy, Burnout, XP)
 * - Effort tracking
 * - Health laws (Bible Laws & 48 Laws of Power)
 */
export default function MasterHealth() {
  const navigate = useNavigate()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const { teams, agents, products, productsLoading, loading } = useSystemData({
    cacheKeyPrefix: 'master-health',
    systemId: MasterDomain.HEALTH,
    agentTypes: [...HEALTH_AGENT_TYPES],
    teamDomains: [...HEALTH_TEAM_DOMAINS],
    fetchProducts: true,
    productFilter: (product) =>
      product.name.toLowerCase().includes('capacity') ||
      product.name.toLowerCase().includes('recovery') ||
      product.name.toLowerCase().includes('effort') ||
      product.name.toLowerCase().includes('burnout') ||
      product.name.toLowerCase().includes('health') ||
      product.id.includes('health-capacity') ||
      product.id.includes('health_capacity'),
  })

  const {
    data: healthStatusData,
    loading: healthStatusLoading,
  } = useDataFetch(
    async () => {
      const status = await healthApi.getStatus()
      return { healthStatus: status }
    },
    {
      cacheKey: 'master-health-status',
      fallbackData: {
        healthStatus: {
          capacity: 50,
          capacityBand: 'medium' as const,
          isInBurnout: false,
          consecutiveHighEffortDays: 0,
          recoveryActionsThisWeek: 0,
          lastRecoveryActionAt: null,
          energy: { current: 100, usable: 100, capacityCap: 100 },
          systems: {
            energy: { capacityModifiesEnergy: true, currentEnergyCap: 100, baseEnergyCap: 100 },
            burnout: { isInBurnout: false, riskLevel: 'low' as const, consecutiveLowCapacityDays: 0 },
            xp: { efficiencyModifier: 1.0 },
          },
        } as HealthStatus,
      },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: 'master-health-status',
      dataSourceName: 'Health Status',
    }
  )

  const healthStatus = healthStatusData?.healthStatus ?? null
  const totalLoading = loading || (healthStatusLoading && !healthStatus)

  return (
    <FeatureErrorBoundary featureName="Health / Capacity System">
      <MasterSystemLayout
        title="Health / Capacity System"
        description="Human operating stability: physical health, mental resilience, cognitive efficiency, and recovery elasticity"
        mantra="Capacity governs everything else."
        icon={HeartPulse}
        color="text-pink-400"
        bgColor="bg-pink-600/20"
        teams={teams}
        agents={agents}
        loading={totalLoading}
        rootNodeId="systems-node-health-universal-concept"
        systemId={SystemId.HEALTH}
        selectedTeam={selectedTeam}
        onTeamSelect={setSelectedTeam}
        renderOverview={({ setView }) => (
          <div className="space-y-8">
            {healthStatus && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <HealthStatusCard healthStatus={healthStatus} />
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
                  onClick={() => setView('teams')}
                  className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-pink-400 border border-transparent group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-pink-400" />
                    <h3 className="font-semibold group-hover:text-pink-400 transition-colors">
                      Domain Teams
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {teams.length} specialized teams for health and capacity
                  </p>
                </button>
                <button
                  onClick={() => setView('agents')}
                  className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-blue-400 border border-transparent group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-6 h-6 text-blue-400" />
                    <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                      Expert Agents
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {agents.length} AI agents for capacity, recovery, and burnout prevention
                  </p>
                </button>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <HeartPulse className="w-6 h-6 text-green-400" />
                    <h3 className="font-semibold">Capacity State</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Capacity is a state (0-100), not a resource. It modifies outcomes, not costs.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recovery Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-4">Recovery Actions</h2>
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-pink-400" />
                      <span className="font-semibold">Recovery Actions This Week</span>
                    </div>
                    <span className="text-2xl font-bold text-pink-400">
                      {healthStatus?.recoveryActionsThisWeek ?? 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {(healthStatus?.recoveryActionsThisWeek ?? 0) >= 4
                      ? 'Maximum recovery rate (+2 Capacity per week)'
                      : (healthStatus?.recoveryActionsThisWeek ?? 0) >= 2
                        ? 'Recovery active (+1 to +2 Capacity per week)'
                        : 'Need 2+ recovery actions for capacity recovery'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Exercise', color: 'text-green-400', xp: 200, capacity: '+250', optionality: '+50', energy: 25 },
                    { name: 'Learning', color: 'text-blue-400', xp: 400, capacity: '+150', engines: '+100', optionality: '+200', energy: 20 },
                    { name: 'Save Expenses', color: 'text-purple-400', xp: 1000, engines: '+200', oxygen: '+500', optionality: '+300', energy: 15 },
                    { name: 'Rest', color: 'text-pink-400', xp: null, capacity: '+2 (recovery only)', energy: 18 },
                  ].map((action) => (
                    <div
                      key={action.name}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                    >
                      <h3 className={`font-semibold mb-2 ${action.color}`}>{action.name}</h3>
                      <div className="space-y-1.5 mb-2">
                        {action.xp != null ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Key className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">
                              XP: <span className="font-semibold text-white">{action.xp}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>No XP</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400 ml-6 flex-wrap">
                          {action.capacity && <span>Capacity: <span className="text-green-400 font-semibold">{action.capacity}</span></span>}
                          {action.engines && <><span className="text-gray-500">•</span><span>Engines: <span className="text-blue-400 font-semibold">{action.engines}</span></span></>}
                          {action.oxygen && <><span className="text-gray-500">•</span><span>Oxygen: <span className="text-cyan-400 font-semibold">{action.oxygen}</span></span></>}
                          {action.optionality && <><span className="text-gray-500">•</span><span>Optionality: <span className="text-purple-400 font-semibold">{action.optionality}</span></span></>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Energy Cost: {action.energy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-4">Products</h2>
              {productsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading products...</div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() =>
                        navigate(getMasterProductRoute(MasterDomain.HEALTH, product.id))
                      }
                      className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-pink-400 border border-transparent group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {product.icon ? (
                          <span className="text-2xl">{product.icon}</span>
                        ) : (
                          <Package className="w-6 h-6 text-pink-400" />
                        )}
                        <h3 className="font-semibold group-hover:text-pink-400 transition-colors">
                          {product.name}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                      {product.type && (
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded border border-pink-500/30">
                            {product.type}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No products available. Products will appear after seeding.
                </div>
              )}
            </motion.div>

            {/* System Interactions & Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-4">System Interactions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-semibold">Energy System</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Capacity modifies your usable energy cap</p>
                  <div className="text-lg font-bold text-yellow-400">
                    {healthStatus?.systems.energy.currentEnergyCap ?? 100} / {healthStatus?.systems.energy.baseEnergyCap ?? 100}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold">XP Efficiency</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Capacity modifies XP gain</p>
                  <div className="text-2xl font-bold text-purple-400">
                    {((healthStatus?.systems.xp.efficiencyModifier ?? 1.0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-semibold">Burnout Risk</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Low Capacity increases burnout risk</p>
                  <span className={`font-semibold capitalize ${
                    (healthStatus?.systems.burnout.riskLevel ?? 'low') === 'high' ? 'text-red-400' :
                    (healthStatus?.systems.burnout.riskLevel ?? 'low') === 'medium' ? 'text-orange-400' :
                    'text-green-400'
                  }`}>
                    {healthStatus?.systems.burnout.riskLevel ?? 'low'}
                  </span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingDown className="w-6 h-6 text-orange-400" />
                    <h3 className="text-xl font-semibold">Effort Tracking</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Consecutive high effort days</p>
                  <div className="text-2xl font-bold text-orange-400">
                    {healthStatus?.consecutiveHighEffortDays ?? 0}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-600/20 rounded-lg mt-1">
                    <RefreshCw className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Weekly Recovery</h3>
                    <p className="text-gray-400 text-sm">
                      Recovery occurs on weekly ticks. Requires 2-4 recovery actions per week for +1 to +2 Capacity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-600/20 rounded-lg mt-1">
                    <TrendingDown className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Effort-Based Decay</h3>
                    <p className="text-gray-400 text-sm">
                      Sustained high effort (7+ days) causes Capacity decay. Chronic imbalance also triggers decay.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-600/20 rounded-lg mt-1">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Energy Modification</h3>
                    <p className="text-gray-400 text-sm">
                      Capacity modifies usable energy cap. High capacity = more energy. Low capacity = less energy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-600/20 rounded-lg mt-1">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Burnout Prevention</h3>
                    <p className="text-gray-400 text-sm">
                      Low Capacity increases burnout risk. Recovery actions help prevent and exit burnout.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      />
    </FeatureErrorBoundary>
  )
}
