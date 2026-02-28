/**
 * MasterRelationships Page
 *
 * Core tier 0 system: Relationships.
 * Structural pillar: If relationship shakes but character is stable, you respond calmly.
 * Links to Trust, Reputation.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Shield, Award, ChevronRight } from 'lucide-react'
import type { Team } from '../services/financeApi'
import MasterSystemLayout from '../components/MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import { TRUST_TEAM_DOMAINS, TRUST_AGENT_TYPES, REPUTATION_TEAM_DOMAINS } from '../config/systemConfig'
import { SystemId } from '../types'

export default function MasterRelationships() {
  const navigate = useNavigate()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const { teams, agents, loading } = useSystemData({
    cacheKeyPrefix: 'master-relationships',
    systemId: 'trust',
    agentTypes: [...TRUST_AGENT_TYPES],
    teamDomains: [...TRUST_TEAM_DOMAINS, ...REPUTATION_TEAM_DOMAINS],
    fetchProducts: false,
  })

  const linkedSystems = [
    { id: 'trust', name: 'Trust', path: '/systems/trust', icon: Shield, description: 'Competence, reliability, alignment' },
    { id: 'reputation', name: 'Reputation', path: '/systems/reputation', icon: Award, description: 'Expectations and access' },
  ]

  return (
    <MasterSystemLayout
      title="Relationships System"
      description="Trust, reputation, and relational capital. Core tier 0 pillar."
      mantra="If relationship shakes but character is stable, you respond calmly."
      icon={Users}
      color="text-teal-400"
      bgColor="bg-teal-500/10 border-teal-500/30"
      teams={teams}
      agents={agents}
      loading={loading}
      rootNodeId="systems-node-trust-universal-concept"
      systemId={SystemId.TRUST}
      selectedTeam={selectedTeam}
      onTeamSelect={setSelectedTeam}
      renderOverview={() => (
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-teal-500/30 bg-teal-500/10">
            <p className="text-teal-200 text-sm">
              <strong>Structural pillar:</strong> Character is foundation. If relationship shakes but character is stable, you respond calmly.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Linked Systems</h3>
            <div className="grid gap-3">
              {linkedSystems.map((sys) => {
                const Icon = sys.icon
                return (
                  <button
                    key={sys.id}
                    onClick={() => navigate(sys.path)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-700 hover:border-teal-500/50 bg-gray-800/60 hover:bg-teal-500/10 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{sys.name}</div>
                      <div className="text-sm text-gray-400">{sys.description}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    />
  )
}
