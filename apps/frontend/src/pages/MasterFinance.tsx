import { useState, useEffect } from 'react'
import { agentsApi, teamsApi, productsApi, Team, Product } from '../services/financeApi'
import { useNavigate } from 'react-router-dom'
import { getMasterProductRoute } from '../config/routes'
import { MasterDomain } from '../types'
import { 
  TrendingUp, 
  Users, 
  Brain, 
  BookOpen, 
  ChevronRight,
  Package
} from 'lucide-react'
import { motion } from 'framer-motion'
import TeamDetailView from '../components/TeamDetailView'
import AgentDetailCard from '../components/AgentDetailCard'
import { useDataFetch } from '../hooks/useDataFetch'
import { 
  AgentsResponseSchema, 
  TeamsResponseSchema,
  validateApiResponse 
} from '../lib/dataValidation'
import { FeatureErrorBoundary } from '../components/ErrorBoundary'
import { logger } from '../lib/logger'
import HierarchyTreeView from '../components/knowledge/HierarchyTreeView'

/**
 * MasterFinance Page
 * 
 * Main interface for the Master Finance System featuring:
 * - Expert AI agents for financial guidance
 * - Domain-focused teams with specialized products
 * - Interactive guides and workflows
 * - Knowledge base search
 */
export default function MasterFinance() {
  const navigate = useNavigate()
  const [view, setView] = useState<'overview' | 'agents' | 'teams' | 'reality'>('overview')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await productsApi.list()
        setProducts(response.products || [])
      } catch (error) {
        logger.error('Failed to load products', error instanceof Error ? error : new Error(String(error)))
      } finally {
        setProductsLoading(false)
      }
    }
    if (view === 'overview') {
      loadProducts()
    }
  }, [view])

  // Fetch agents with resilience
  const {
    data: agentsData,
    loading: agentsLoading,
  } = useDataFetch(
    async () => {
      const response = await agentsApi.list()
      return validateApiResponse(AgentsResponseSchema, response, { agents: [] })
    },
    {
      cacheKey: 'master-money-agents',
      fallbackData: { agents: [] },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: 'master-money-agents',
      dataSourceName: 'Expert Agents',
    }
  )

  // Fetch teams with resilience
  const {
    data: teamsData,
    loading: teamsLoading,
  } = useDataFetch(
    async () => {
      const response = await teamsApi.list()
      return validateApiResponse(TeamsResponseSchema, response, { teams: [] })
    },
    {
      cacheKey: 'master-money-teams',
      fallbackData: { teams: [] },
      enableHealthCheck: true,
      retries: 3,
      dataSourceId: 'master-money-teams',
      dataSourceName: 'Domain Teams',
    }
  )

  // Ensure order defaults to 0 for type safety
  const agents = (agentsData?.agents || []).map(agent => ({
    ...agent,
    order: agent.order ?? 0,
  }))
  const teams = (teamsData?.teams || []).map(team => ({
    ...team,
    order: team.order ?? 0,
  }))
  const loading = agentsLoading || teamsLoading

  if (loading && agents.length === 0 && teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Loading Master Finance System...</div>
          <div className="text-sm text-gray-400">Fetching agents and teams</div>
        </div>
      </div>
    )
  }

  return (
    <FeatureErrorBoundary featureName="Master Finance System">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Master Finance System</h1>
                <p className="text-gray-400 mt-1">Expert financial guidance powered by AI agents</p>
              </div>
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
          onClick={() => setView('teams')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'teams'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Domain Teams ({teams.length})
        </button>
        <button
          onClick={() => setView('agents')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'agents'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Expert Agents ({agents.length})
        </button>
        <button
          onClick={() => setView('reality')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'reality'
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
          {/* System Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setView('teams')}
                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-green-400 border border-transparent group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-green-400" />
                  <h3 className="font-semibold group-hover:text-green-400 transition-colors">Domain Teams</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-400 text-sm">
                  {teams.length} specialized teams covering investment, tax, cash flow, debt management, and more
                </p>
              </button>
              <button
                onClick={() => setView('agents')}
                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-purple-400 border border-transparent group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <h3 className="font-semibold group-hover:text-purple-400 transition-colors">Expert Agents</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-400 text-sm">
                  {agents.length} AI agents with specialized knowledge in finance, investing, accounting, and tax strategy
                </p>
              </button>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-6 h-6 text-yellow-400" />
                  <h3 className="font-semibold">Guided Workflows</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Interactive step-by-step guides for making money, optimizing finances, and building wealth
                </p>
              </div>
            </div>
          </motion.div>

          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                    onClick={() => navigate(getMasterProductRoute(MasterDomain.FINANCE, product.id))}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-blue-400 border border-transparent group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {product.icon ? (
                        <span className="text-2xl">{product.icon}</span>
                      ) : (
                        <Package className="w-6 h-6 text-blue-400" />
                      )}
                      <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No products available</div>
            )}
          </motion.div>

        </div>
      )}

      {/* Teams View */}
      {view === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{team.icon || '👥'}</div>
                <h2 className="text-xl font-semibold">{team.name}</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{team.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Domain: {team.domain}</span>
                {team.agentCount !== undefined && (
                  <span className="text-blue-400">{team.agentCount} agents</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Agents View */}
      {view === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      )}

      {/* Empty States */}
      {view === 'teams' && teams.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No teams available yet. Teams will appear here once they're configured.</p>
        </div>
      )}

      {view === 'agents' && agents.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No agents available yet. Agents will appear here once they're configured.</p>
        </div>
      )}

      {/* Reality Hierarchy View */}
      {view === 'reality' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HierarchyTreeView rootNodeId="constraints-of-reality" />
        </motion.div>
      )}

        {/* Team Detail View (Amazon-style console) */}
        {selectedTeam && (
          <TeamDetailView
            team={selectedTeam}
            onClose={() => setSelectedTeam(null)}
          />
        )}
      </div>
    </FeatureErrorBoundary>
  )
}
