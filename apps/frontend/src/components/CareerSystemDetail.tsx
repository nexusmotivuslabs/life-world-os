/**
 * Career System Detail Component
 *
 * Displays detailed information for career/cross-system systems:
 * - Trust
 * - Reputation
 * - Optionality
 *
 * Uses MasterSystemLayout with Overview, Domain Teams, Expert Agents, Universal Concepts.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Award,
  Network,
  Users,
  Brain,
  Package,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { Team } from '../services/financeApi'
import MasterSystemLayout from './MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import {
  OPTIONALITY_TEAM_DOMAINS,
  OPTIONALITY_AGENT_TYPES,
  TRUST_TEAM_DOMAINS,
  TRUST_AGENT_TYPES,
  REPUTATION_TEAM_DOMAINS,
} from '../config/systemConfig'
import { SystemId } from '../types'

/** Career sub-systems that have their own detail pages (Trust, Reputation, Optionality). */
export const CAREER_SYSTEM_IDS = [SystemId.TRUST, SystemId.REPUTATION, SystemId.OPTIONALITY] as const
export type CareerDetailSystemId = (typeof CAREER_SYSTEM_IDS)[number]

interface CareerSystemDetailProps {
  systemId: SystemId
}

interface SystemConfig {
  name: string
  mantra: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  teamDomains: readonly string[]
  agentTypes: readonly string[]
}

const systemConfigs: Record<CareerDetailSystemId, SystemConfig> = {
  [SystemId.TRUST]: {
    name: 'Trust System',
    mantra: 'Trust is a forward-looking belief.',
    description:
      'Global modifier that affects multiple systems. Built on competence, reliability, and alignment. Low trust restricts opportunities and increases costs across all systems.',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    teamDomains: TRUST_TEAM_DOMAINS,
    agentTypes: TRUST_AGENT_TYPES,
  },
  [SystemId.REPUTATION]: {
    name: 'Reputation System',
    mantra: 'Reputation is not what people think of you. It is what they expect from you.',
    description:
      'Cross-system state that governs access to opportunities, partnerships, and resources. Reputation compounds slowly but can be lost quickly through repeated violations.',
    icon: Award,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    teamDomains: REPUTATION_TEAM_DOMAINS,
    agentTypes: TRUST_AGENT_TYPES,
  },
  [SystemId.OPTIONALITY]: {
    name: 'Optionality System',
    mantra: 'Optionality is the right, but not the obligation, to act.',
    description:
      'Cross-system state representing available choices and strategic freedom. High optionality unlocks higher-risk, higher-reward actions across all systems.',
    icon: Network,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/30',
    teamDomains: OPTIONALITY_TEAM_DOMAINS,
    agentTypes: OPTIONALITY_AGENT_TYPES,
  },
}

export default function CareerSystemDetail({ systemId }: CareerSystemDetailProps) {
  const navigate = useNavigate()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const config = systemConfigs[systemId]
  const Icon = config.icon

  const { teams, agents, products, loading } = useSystemData({
    cacheKeyPrefix: `career-system-${systemId}`,
    systemId,
    agentTypes: [...config.agentTypes],
    teamDomains: [...config.teamDomains],
    fetchProducts: true,
  })

  const handleProductClick = (productId: string) => {
    navigate(`/master/finance/products/${productId}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/systems')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Systems
        </button>
        <MasterSystemLayout
          title={config.name}
          description={config.description}
          mantra={config.mantra}
          icon={Icon}
          color={config.color}
          bgColor={config.bgColor}
          teams={teams}
          agents={agents}
          loading={loading}
          rootNodeId="constraints-of-reality"
          systemId={systemId}
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
          renderOverview={() => (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${config.bgColor} rounded-xl p-6 border-2`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Users className={`w-6 h-6 ${config.color}`} />
                    <h3 className="text-lg font-semibold">Domain Teams</h3>
                  </div>
                  <p className="text-3xl font-bold">{teams.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Specialized teams</p>
                </div>

                <div className={`${config.bgColor} rounded-xl p-6 border-2`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className={`w-6 h-6 ${config.color}`} />
                    <h3 className="text-lg font-semibold">Expert Agents</h3>
                  </div>
                  <p className="text-3xl font-bold">{agents.length}</p>
                  <p className="text-sm text-gray-400 mt-1">AI specialists</p>
                </div>

                <div className={`${config.bgColor} rounded-xl p-6 border-2`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Package className={`w-6 h-6 ${config.color}`} />
                    <h3 className="text-lg font-semibold">Products</h3>
                  </div>
                  <p className="text-3xl font-bold">{products.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Tools & workflows</p>
                </div>
              </div>

              {/* Teams Section */}
              {teams.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Domain Teams</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teams.map((team, index) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedTeam(team)}
                        className={`${config.bgColor} rounded-xl p-6 border-2 cursor-pointer hover:border-opacity-60 transition-all hover:scale-[1.02]`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
                            <p className="text-gray-400 text-sm">{team.description}</p>
                          </div>
                          <ChevronRight className={`w-6 h-6 ${config.color} flex-shrink-0`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {products.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Products & Tools</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleProductClick(product.id)}
                        className={`${config.bgColor} rounded-xl p-6 border-2 cursor-pointer hover:border-opacity-60 transition-all hover:scale-[1.02]`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Package className={`w-6 h-6 ${config.color}`} />
                          <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">
                            {product.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        <p className="text-gray-400 text-sm">{product.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}
