/**
 * AgentDetailCard Component
 * 
 * Displays agent details with expandable pro tips, what to avoid, and best practices.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import KeyDetailsList from './KeyDetailsList'
import { Agent } from '../services/financeApi'

interface AgentMetadata {
  proTips?: string[]
  whatToAvoid?: string[]
  bestPractices?: string[]
}

interface AgentDetailCardProps {
  agent: Agent & { metadata?: AgentMetadata }
}

export default function AgentDetailCard({ agent }: AgentDetailCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const metadata = agent.metadata || {}
  const hasProTips = metadata.proTips && metadata.proTips.length > 0
  const hasWhatToAvoid = metadata.whatToAvoid && metadata.whatToAvoid.length > 0
  const hasBestPractices = metadata.bestPractices && metadata.bestPractices.length > 0

  if (!hasProTips && !hasWhatToAvoid && !hasBestPractices) {
    // Fallback to simple card if no metadata
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          {agent.avatar && <span className="text-2xl">{agent.avatar}</span>}
          <h4 className="font-semibold">{agent.name}</h4>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2">{agent.description}</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{agent.avatar || '🤖'}</div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{agent.description}</p>
          <div className="text-xs text-gray-500 line-clamp-1">{agent.expertise}</div>
        </div>
      </div>

      {/* Pro Tips Section */}
      {hasProTips && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('proTips')}
            className="w-full flex items-center justify-between p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-blue-400">Pro Tips</span>
              <span className="text-xs text-gray-400">({metadata.proTips?.length})</span>
            </div>
            {expandedSections.has('proTips') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.has('proTips') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pl-4 border-l-2 border-blue-500/30"
              >
                <KeyDetailsList
                  items={metadata.proTips ?? []}
                  hideTitle
                  bulletColor="bg-blue-400"
                  contentClassName=""
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* What to Avoid Section */}
      {hasWhatToAvoid && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('whatToAvoid')}
            className="w-full flex items-center justify-between p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-400">What to Avoid</span>
              <span className="text-xs text-gray-400">({metadata.whatToAvoid?.length})</span>
            </div>
            {expandedSections.has('whatToAvoid') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.has('whatToAvoid') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pl-4 border-l-2 border-red-500/30"
              >
                <KeyDetailsList
                  items={metadata.whatToAvoid ?? []}
                  hideTitle
                  bulletColor="bg-red-400"
                  contentClassName=""
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Best Practices Section */}
      {hasBestPractices && (
        <div>
          <button
            onClick={() => toggleSection('bestPractices')}
            className="w-full flex items-center justify-between p-3 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-400">Best Practices</span>
              <span className="text-xs text-gray-400">({metadata.bestPractices?.length})</span>
            </div>
            {expandedSections.has('bestPractices') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.has('bestPractices') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pl-4 border-l-2 border-green-500/30"
              >
                <KeyDetailsList
                  items={metadata.bestPractices ?? []}
                  hideTitle
                  bulletColor="bg-green-400"
                  contentClassName=""
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

