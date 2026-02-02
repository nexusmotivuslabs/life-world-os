/**
 * MasterSystemLayout
 *
 * Parent component that all systems (Finance, Health, Energy, Travel, Optionality, Trust, Reputation) inherit from.
 * Provides a consistent four-feature structure: Overview, Domain Teams, Expert Agents, Universal Concepts.
 * Each system injects its own content via render props.
 */

import { useState } from 'react'
import { Users, Brain, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import TeamDetailView from './TeamDetailView'
import AgentDetailCard from './AgentDetailCard'
import DomainTag from './DomainTag'
import HierarchyTreeView from './knowledge/HierarchyTreeView'
import type { Team, Agent } from '../services/financeApi'

export type MasterSystemView = 'overview' | 'teams' | 'agents' | 'concepts'

export interface MasterSystemLayoutProps {
  title: string
  description: string
  mantra?: string
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  teams: Team[]
  agents: Agent[]
  loading?: boolean
  rootNodeId?: string
  /** Custom content for Overview tab */
  renderOverview: (props: { setView: (view: MasterSystemView) => void }) => React.ReactNode
  /** Optional custom content for Universal Concepts (default: HierarchyTreeView) */
  renderConcepts?: () => React.ReactNode
  /** Optional custom empty state for Teams tab */
  renderTeamsEmpty?: () => React.ReactNode
  /** Optional custom empty state for Agents tab */
  renderAgentsEmpty?: () => React.ReactNode
  /** Callback when team is selected (for modal) */
  onTeamSelect?: (team: Team | null) => void
  /** Currently selected team (when showing TeamDetailView) */
  selectedTeam?: Team | null
}

const defaultTeamsEmpty = () => (
  <div className="text-center py-12 text-gray-400">
    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
    <p>No teams available yet. Teams will appear here once they're configured.</p>
  </div>
)

const defaultAgentsEmpty = () => (
  <div className="text-center py-12 text-gray-400">
    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
    <p>No agents available yet. Agents will appear here once they're configured.</p>
  </div>
)

export default function MasterSystemLayout({
  title,
  description,
  mantra,
  icon: Icon,
  color,
  bgColor,
  teams,
  agents,
  loading = false,
  rootNodeId = 'constraints-of-reality',
  renderOverview,
  renderConcepts,
  renderTeamsEmpty = defaultTeamsEmpty,
  renderAgentsEmpty = defaultAgentsEmpty,
  onTeamSelect,
  selectedTeam = null,
}: MasterSystemLayoutProps) {
  const [view, setView] = useState<MasterSystemView>('overview')

  if (loading && teams.length === 0 && agents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Loading {title}...</div>
          <div className="text-sm text-gray-400">Fetching data</div>
        </div>
      </div>
    )
  }

  const handleSetView = (v: MasterSystemView) => setView(v)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 ${bgColor} rounded-lg`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{title}</h1>
              <p className="text-gray-400 mt-1">
                {mantra ? (
                  <span className={`italic ${color}`}>{mantra}</span>
                ) : (
                  description
                )}
              </p>
              {mantra && <p className="text-gray-400 text-sm mt-1">{description}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'overview' ? `${color} border-b-2 ${color.replace('text-', 'border-')}` : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('teams')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'teams' ? `${color} border-b-2 ${color.replace('text-', 'border-')}` : 'text-gray-400 hover:text-white'
          }`}
        >
          Domain Teams ({teams.length})
        </button>
        <button
          onClick={() => setView('agents')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'agents' ? `${color} border-b-2 ${color.replace('text-', 'border-')}` : 'text-gray-400 hover:text-white'
          }`}
        >
          Expert Agents ({agents.length})
        </button>
        <button
          onClick={() => setView('concepts')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'concepts' ? `${color} border-b-2 ${color.replace('text-', 'border-')}` : 'text-gray-400 hover:text-white'
          }`}
        >
          Universal Concepts
        </button>
      </div>

      {/* Overview View */}
      {view === 'overview' && renderOverview({ setView: handleSetView })}

      {/* Teams View */}
      {view === 'teams' && (
        <>
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-opacity-60 transition-all cursor-pointer"
                  onClick={() => onTeamSelect?.(team)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{team.icon || '👥'}</div>
                    <h2 className="text-xl font-semibold">{team.name}</h2>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{team.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <DomainTag domain={team.domain} size="sm" />
                    {team.agentCount !== undefined && (
                      <span className={color}>{team.agentCount} agents</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            renderTeamsEmpty()
          )}
        </>
      )}

      {/* Agents View */}
      {view === 'agents' && (
        <>
          {agents.length > 0 ? (
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
          ) : (
            renderAgentsEmpty()
          )}
        </>
      )}

      {/* Universal Concepts View */}
      {view === 'concepts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {renderConcepts ? renderConcepts() : <HierarchyTreeView rootNodeId={rootNodeId} />}
        </motion.div>
      )}

      {/* Team Detail Modal */}
      {selectedTeam && onTeamSelect && (
        <TeamDetailView team={selectedTeam} onClose={() => onTeamSelect(null)} />
      )}
    </div>
  )
}
