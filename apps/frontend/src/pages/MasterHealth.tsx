import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { healthApi, HealthStatus } from '../services/healthApi'
import { agentsApi, teamsApi, productsApi, Agent, Team, Product } from '../services/financeApi'
import { getMasterProductRoute } from '../config/routes'
import { MasterDomain } from '../types'
import { 
  HeartPulse, 
  Activity,
  BookOpen, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Shield,
  RefreshCw,
  Brain,
  Users,
  Package
} from 'lucide-react'
import { motion } from 'framer-motion'
import HealthStatusCard from '../components/HealthStatusCard'
import AgentDetailCard from '../components/AgentDetailCard'
import TeamDetailView from '../components/TeamDetailView'
import { useDataFetch } from '../hooks/useDataFetch'
import { 
  AgentsResponseSchema, 
  TeamsResponseSchema,
  validateApiResponse 
} from '../lib/dataValidation'
import { FeatureErrorBoundary } from '../components/ErrorBoundary'
import HierarchyTreeView from '../components/knowledge/HierarchyTreeView'

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
  const [view, setView] = useState<'overview' | 'recovery' | 'systems' | 'agents' | 'teams' | 'concepts'>('overview')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  // Fetch health status with resilience (following Finance system pattern)
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
          energy: {
            current: 100,
            usable: 100,
            capacityCap: 100,
          },
          systems: {
            energy: {
              capacityModifiesEnergy: true,
              currentEnergyCap: 100,
              baseEnergyCap: 100,
            },
            burnout: {
              isInBurnout: false,
              riskLevel: 'low' as const,
              consecutiveLowCapacityDays: 0,
            },
            xp: {
              efficiencyModifier: 1.0,
            },
          },
        } as HealthStatus
      },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: 'master-health-status',
      dataSourceName: 'Health Status',
    }
  )

  // Fetch health agents (filter for health/capacity agents)
  const {
    data: agentsData,
    loading: agentsLoading,
    error: agentsError,
    retry: retryAgents,
    isPartial: agentsPartial,
  } = useDataFetch(
    async () => {
      const response = await agentsApi.list()
      const validated = validateApiResponse(AgentsResponseSchema, response, { agents: [] })
      // Filter for health/capacity agents
      const healthAgents = validated.agents.filter(agent => 
        agent.type === 'CAPACITY_SPECIALIST' || 
        agent.type === 'RECOVERY_COACH' || 
        agent.type === 'BURNOUT_PREVENTION_SPECIALIST'
      )
      return { agents: healthAgents }
    },
    {
      cacheKey: 'master-health-agents',
      fallbackData: { agents: [] },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: 'master-health-agents',
      dataSourceName: 'Health Expert Agents',
    }
  )

  // Fetch health team
  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
    retry: retryTeams,
    isPartial: teamsPartial,
  } = useDataFetch(
    async () => {
      const response = await teamsApi.list()
      const validated = validateApiResponse(TeamsResponseSchema, response, { teams: [] })
      // Filter for health team
      const healthTeam = validated.teams.filter(team => team.domain === 'HEALTH_CAPACITY')
      return { teams: healthTeam }
    },
    {
      cacheKey: 'master-health-teams',
      fallbackData: { teams: [] },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: 'master-health-teams',
      dataSourceName: 'Health & Capacity Team',
    }
  )

  // Fetch products for health team
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await productsApi.list()
        const allProducts = response.products || []
        // Filter products that are health/capacity related
        // These should match the products created in seedTeams.ts for HEALTH_CAPACITY team
        const healthProducts = allProducts.filter(product => 
          product.name.toLowerCase().includes('capacity') ||
          product.name.toLowerCase().includes('recovery') ||
          product.name.toLowerCase().includes('effort') ||
          product.name.toLowerCase().includes('burnout') ||
          product.name.toLowerCase().includes('health') ||
          product.id.includes('health-capacity') ||
          product.id.includes('health_capacity')
        )
        // Sort by order if available
        healthProducts.sort((a, b) => (a.order || 0) - (b.order || 0))
        setProducts(healthProducts)
      } catch (error) {
        logger.error('Failed to load products', error instanceof Error ? error : new Error(String(error)))
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }
    if (view === 'overview') {
      loadProducts()
    }
  }, [view])

  const healthStatus = healthStatusData?.healthStatus || null
  const agents = (agentsData?.agents || []).map(agent => ({
    ...agent,
    order: agent.order ?? 0,
  }))
  const teams = (teamsData?.teams || []).map(team => ({
    ...team,
    order: team.order ?? 0,
  }))
  const loading = healthStatusLoading || agentsLoading || teamsLoading

  if (loading && agents.length === 0 && teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Loading Health System...</div>
          <div className="text-sm text-gray-400">Fetching health data, agents, and teams</div>
        </div>
      </div>
    )
  }

  return (
    <FeatureErrorBoundary featureName="Health / Capacity System">
      <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-pink-600/20">
            <HeartPulse className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Health / Capacity System</h1>
            <p className="text-gray-400 mt-1">
              Human operating stability: physical health, mental resilience, cognitive efficiency, and recovery elasticity
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
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('teams')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'teams'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Health Team ({teams.length})
        </button>
        <button
          onClick={() => setView('agents')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'agents'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Expert Agents ({agents.length})
        </button>
        <button
          onClick={() => setView('recovery')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'recovery'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Recovery
        </button>
        <button
          onClick={() => setView('systems')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'systems'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          System Interactions
        </button>
        <button
          onClick={() => setView('concepts')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'concepts'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Universal Concepts
        </button>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <div className="space-y-8">
          {/* Health Status Card */}
          {healthStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
                onClick={() => setView('recovery')}
                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-pink-400 border border-transparent group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-6 h-6 text-pink-400" />
                  <h3 className="font-semibold group-hover:text-pink-400 transition-colors">Recovery Actions</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-400 text-sm">
                  Exercise, Learning, Save Expenses, and Rest actions improve Capacity over time.
                </p>
              </button>
              <button
                onClick={() => setView('systems')}
                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-blue-400 border border-transparent group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h3 className="font-semibold group-hover:text-blue-400 transition-colors">System Interactions</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-400 text-sm">
                  See how Capacity affects Energy, XP efficiency, and Burnout risk.
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
                    onClick={() => navigate(getMasterProductRoute(MasterDomain.HEALTH, product.id))}
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
              <div className="text-center py-8 text-gray-400">No products available. Products will appear after seeding.</div>
            )}
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
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

      {/* Teams View */}
      {view === 'teams' && (
        <div className="space-y-8">
          {teams.length > 0 ? (
            teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TeamDetailView
                  team={team}
                  onTeamSelect={setSelectedTeam}
                  isSelected={selectedTeam?.id === team.id}
                />
              </motion.div>
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <p className="text-gray-400">No health teams available. Teams will appear after seeding.</p>
            </div>
          )}
        </div>
      )}

      {/* Agents View */}
      {view === 'agents' && (
        <div className="space-y-8">
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AgentDetailCard agent={agent} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
              <p className="text-gray-400">No health agents available. Agents will appear after seeding.</p>
            </div>
          )}
        </div>
      )}

      {/* Recovery View */}
      {view === 'recovery' && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-green-400">Exercise</h3>
                  <p className="text-sm text-gray-400 mb-2">Grants XP and improves Capacity</p>
                  <p className="text-xs text-gray-500">Energy Cost: 25</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-blue-400">Learning</h3>
                  <p className="text-sm text-gray-400 mb-2">Grants XP and improves Capacity</p>
                  <p className="text-xs text-gray-500">Energy Cost: 20</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-purple-400">Save Expenses</h3>
                  <p className="text-sm text-gray-400 mb-2">Grants XP and improves Capacity</p>
                  <p className="text-xs text-gray-500">Energy Cost: 15</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2 text-pink-400">Rest</h3>
                  <p className="text-sm text-gray-400 mb-2">No XP, improves Capacity only</p>
                  <p className="text-xs text-gray-500">Energy Cost: 18</p>
                </div>
              </div>

              {healthStatus?.lastRecoveryActionAt && (
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-pink-400" />
                    <div>
                      <div className="text-sm font-semibold text-gray-300">Last Recovery Action</div>
                      <div className="text-xs text-gray-400">
                        {new Date(healthStatus.lastRecoveryActionAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Systems View */}
      {view === 'systems' && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">System Interactions</h2>
            <div className="space-y-4">
              {/* Energy System */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-semibold">Energy System</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Capacity modifies your usable energy cap:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Current Energy Cap</div>
                    <div className="text-lg font-bold text-yellow-400">
                      {healthStatus?.systems.energy.currentEnergyCap ?? 100}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Base Energy Cap</div>
                    <div className="text-lg font-bold text-gray-300">
                      {healthStatus?.systems.energy.baseEnergyCap ?? 100}
                    </div>
                  </div>
                </div>
              </div>

              {/* XP System */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold">XP Efficiency</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Capacity modifies XP gain efficiency:
                </p>
                <div className="text-3xl font-bold text-purple-400">
                  {((healthStatus?.systems.xp.efficiencyModifier ?? 1.0) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {(healthStatus?.systems.xp.efficiencyModifier ?? 1.0) < 1
                    ? `-${((1 - (healthStatus?.systems.xp.efficiencyModifier ?? 1.0)) * 100).toFixed(0)}% XP penalty`
                    : (healthStatus?.systems.xp.efficiencyModifier ?? 1.0) > 1
                    ? `+${(((healthStatus?.systems.xp.efficiencyModifier ?? 1.0) - 1) * 100).toFixed(0)}% XP bonus`
                    : 'Normal XP efficiency'}
                </p>
              </div>

              {/* Burnout System */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-semibold">Burnout Risk</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Low Capacity increases burnout risk:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Risk Level</span>
                    <span className={`font-semibold capitalize ${
                      (healthStatus?.systems.burnout.riskLevel ?? 'low') === 'high' ? 'text-red-400' :
                      (healthStatus?.systems.burnout.riskLevel ?? 'low') === 'medium' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {healthStatus?.systems.burnout.riskLevel ?? 'low'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Consecutive Low Days</span>
                    <span className="font-semibold text-gray-300">
                      {healthStatus?.systems.burnout.consecutiveLowCapacityDays ?? 0}
                    </span>
                  </div>
                  {healthStatus?.isInBurnout && (
                    <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                      <div className="text-sm font-semibold text-red-300">Currently in Burnout</div>
                      <div className="text-xs text-red-400 mt-1">
                        Energy cap reduced to 40. XP efficiency reduced by 70%. Work actions blocked.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Effort Tracking */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="w-6 h-6 text-orange-400" />
                  <h3 className="text-xl font-semibold">Effort Tracking</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Sustained high effort causes Capacity decay:
                </p>
                <div className="text-3xl font-bold text-orange-400">
                  {healthStatus?.consecutiveHighEffortDays ?? 0}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {(healthStatus?.consecutiveHighEffortDays ?? 0) >= 21
                    ? 'Critical: -3 Capacity decay on weekly tick'
                    : (healthStatus?.consecutiveHighEffortDays ?? 0) >= 14
                    ? 'High: -2 Capacity decay on weekly tick'
                    : (healthStatus?.consecutiveHighEffortDays ?? 0) >= 7
                    ? 'Warning: -1 Capacity decay on weekly tick'
                    : 'No decay risk'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
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
    </FeatureErrorBoundary>
  )
}

