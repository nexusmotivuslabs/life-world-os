/**
 * MasterCareer Page
 *
 * Core tier 0 system: Career.
 * Structural pillar: If career shakes but character is stable, you adapt.
 * Links to Engines, Trust, Reputation, Optionality.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Shield, Award, Network, DollarSign, ChevronRight } from 'lucide-react'
import type { Team } from '../services/financeApi'
import MasterSystemLayout from '../components/MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import {
  TRUST_TEAM_DOMAINS,
  TRUST_AGENT_TYPES,
  OPTIONALITY_TEAM_DOMAINS,
  OPTIONALITY_AGENT_TYPES,
} from '../config/systemConfig'
import { MasterDomain } from '../types'
import { getMasterRoute } from '../config/routes'

export default function MasterCareer() {
  const navigate = useNavigate()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const { teams, agents, loading } = useSystemData({
    cacheKeyPrefix: 'master-career',
    systemId: 'trust',
    agentTypes: [...TRUST_AGENT_TYPES, ...OPTIONALITY_AGENT_TYPES],
    teamDomains: [...TRUST_TEAM_DOMAINS, ...OPTIONALITY_TEAM_DOMAINS],
    fetchProducts: false,
  })

  const linkedSystems = [
    { id: 'finance', name: 'Finance', path: getMasterRoute(MasterDomain.FINANCE), icon: DollarSign, description: 'Engines, income, cash flow' },
    { id: 'trust', name: 'Trust', path: '/systems/trust', icon: Shield, description: 'Competence, reliability, alignment' },
    { id: 'reputation', name: 'Reputation', path: '/systems/reputation', icon: Award, description: 'Access to opportunities' },
    { id: 'optionality', name: 'Optionality', path: '/systems/optionality', icon: Network, description: 'Strategic freedom' },
  ]

  return (
    <MasterSystemLayout
      title="Career System"
      description="Income generation, professional development, and strategic optionality. Core tier 0 pillar."
      mantra="If career shakes but character is stable, you adapt."
      icon={Briefcase}
      color="text-amber-400"
      bgColor="bg-amber-500/10 border-amber-500/30"
      teams={teams}
      agents={agents}
      loading={loading}
      systemId={MasterDomain.CAREER}
      rootNodeId="systems-node-career-universal-concept"
      systemId="career"
      selectedTeam={selectedTeam}
      onTeamSelect={setSelectedTeam}
      renderOverview={({ setView }) => (
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <p className="text-amber-200 text-sm">
              <strong>Structural pillar:</strong> Character is foundation. If career shakes but character is stable, you adapt.
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
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-700 hover:border-amber-500/50 bg-gray-800/60 hover:bg-amber-500/10 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-amber-400 shrink-0" />
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
