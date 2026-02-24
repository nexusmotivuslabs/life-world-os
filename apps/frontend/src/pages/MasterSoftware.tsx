import { Network, Code, Layers, Shield, BookOpen } from 'lucide-react'
import MasterSystemLayout from '../components/MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import { SOFTWARE_AGENT_TYPES, SOFTWARE_TEAM_DOMAINS } from '../config/systemConfig'
import { MasterDomain } from '../types'

export default function MasterSoftware() {
  const { teams, agents } = useSystemData({
    cacheKeyPrefix: 'master-software',
    systemId: MasterDomain.SOFTWARE,
    agentTypes: [...SOFTWARE_AGENT_TYPES],
    teamDomains: [...SOFTWARE_TEAM_DOMAINS],
    fetchProducts: false,
  })

  return (
    <MasterSystemLayout
      title="Master Software System"
      description="Design, build, and operate software systems for tech practitioners"
      mantra="Systems compound; clarity compounds."
      icon={Network}
      color="text-indigo-400"
      bgColor="bg-indigo-600/20"
      teams={teams}
      agents={agents}
      loading={false}
      rootNodeId="systems-node-leverage_tier-software-universal-concept"
      systemId="software"
      renderOverview={({ setView }) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-6 h-6 text-indigo-300" />
                <h3 className="text-lg font-semibold text-white">Engineering Focus</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Architecture, delivery, testing, and API design are treated as leverage systems
                that compound team output and quality over time.
              </p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Layers className="w-6 h-6 text-indigo-300" />
                <h3 className="text-lg font-semibold text-white">Universal Concepts</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Explore software pathways like languages, algorithms, delivery, and agile
                through the universal concept hierarchy.
              </p>
              <button
                onClick={() => setView('concepts')}
                className="mt-4 inline-flex items-center px-3 py-2 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 text-sm hover:bg-indigo-500/30 transition-colors"
              >
                Explore Concepts
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-300" />
                <span className="text-sm font-semibold text-white">Quality & Reliability</span>
              </div>
              <p className="text-xs text-gray-400">
                Build confidence with testing, observability, and fast feedback loops.
              </p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-300" />
                <span className="text-sm font-semibold text-white">Pareto Knowledge</span>
              </div>
              <p className="text-xs text-gray-400">
                Each pathway focuses on the 20% that drives 80% of the results.
              </p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-5 h-5 text-indigo-300" />
                <span className="text-sm font-semibold text-white">Leverage Tier</span>
              </div>
              <p className="text-xs text-gray-400">
                Systems that multiply output across teams, tools, and infrastructure.
              </p>
            </div>
          </div>
        </div>
      )}
    />
  )
}
