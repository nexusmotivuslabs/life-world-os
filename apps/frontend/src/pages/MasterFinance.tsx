import { useState } from 'react'
import type { Team } from '../services/financeApi'
import { useNavigate } from 'react-router-dom'
import { getMasterProductRoute } from '../config/routes'
import { MasterDomain, SystemId } from '../types'
import {
  TrendingUp,
  Users,
  Brain,
  BookOpen,
  ChevronRight,
  Package,
} from 'lucide-react'
import { motion } from 'framer-motion'
import MasterSystemLayout from '../components/MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import { FeatureErrorBoundary } from '../components/ErrorBoundary'
import { FINANCE_AGENT_TYPES, FINANCE_TEAM_DOMAINS } from '../config/systemConfig'

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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const { teams, agents, products, productsLoading, loading } = useSystemData({
    cacheKeyPrefix: 'master-finance',
    systemId: MasterDomain.FINANCE,
    agentTypes: [...FINANCE_AGENT_TYPES],
    teamDomains: [...FINANCE_TEAM_DOMAINS],
    fetchProducts: true,
  })

  return (
    <FeatureErrorBoundary featureName="Master Finance System">
      <MasterSystemLayout
        title="Master Finance System"
        description="Expert financial guidance powered by AI agents"
        mantra="Cash flow is oxygen. Buffers are armor."
        icon={TrendingUp}
        color="text-blue-400"
        bgColor="bg-blue-600/20"
        teams={teams}
        agents={agents}
        loading={loading}
        rootNodeId="systems-node-finance-universal-concept"
        systemId={SystemId.FINANCE}
        selectedTeam={selectedTeam}
        onTeamSelect={setSelectedTeam}
        renderOverview={({ setView }) => (
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
                    <h3 className="font-semibold group-hover:text-green-400 transition-colors">
                      Domain Teams
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {teams.length} specialized teams covering investment, tax, cash flow, debt
                    management, and more
                  </p>
                </button>
                <button
                  onClick={() => setView('agents')}
                  className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-purple-400 border border-transparent group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <h3 className="font-semibold group-hover:text-purple-400 transition-colors">
                      Expert Agents
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {agents.length} AI agents with specialized knowledge in finance, investing,
                    accounting, and tax strategy
                  </p>
                </button>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-6 h-6 text-yellow-400" />
                    <h3 className="font-semibold">Guided Workflows</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Interactive step-by-step guides for making money, optimizing finances, and
                    building wealth
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
                      onClick={() =>
                        navigate(getMasterProductRoute(MasterDomain.FINANCE, product.id))
                      }
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
      />
    </FeatureErrorBoundary>
  )
}
