/**
 * Generic Tier View Component
 * 
 * A reusable template for displaying any collection of items organized by tiers.
 * Can be used for systems, artifacts, or any other tier-based data structure.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronDown,
  AlertTriangle,
  Shield,
  TrendingUp,
  Zap,
  Sparkles,
  Network
} from 'lucide-react'
import { SystemTier, TIER_METADATA } from '../types'

export interface TierItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  route?: string
  color: string
  bgColor: string
  status?: 'active' | 'coming-soon'
  tags?: string[]
  mantra?: string
  [key: string]: any // Allow additional properties
}

export interface GenericTierViewProps {
  title?: string
  description?: string
  items: TierItem[]
  getItemTier: (item: TierItem) => SystemTier
  renderItem?: (item: TierItem, index: number) => React.ReactNode
  onItemClick?: (item: TierItem) => void
  defaultExpandedTiers?: SystemTier[]
  showFooterNote?: boolean
  footerNote?: React.ReactNode
}

export default function GenericTierView({
  title = 'Explore Systems',
  description = 'Universal system hierarchy: Survival, Stability, Growth, Leverage, Expression',
  items,
  getItemTier,
  renderItem,
  onItemClick,
  defaultExpandedTiers = [],
  showFooterNote = true,
  footerNote
}: GenericTierViewProps) {
  const navigate = useNavigate()
  const [expandedTiers, setExpandedTiers] = useState<Set<SystemTier>>(
    new Set(defaultExpandedTiers)
  )

  const toggleTier = (tier: SystemTier) => {
    const newExpanded = new Set(expandedTiers)
    if (newExpanded.has(tier)) {
      newExpanded.delete(tier)
    } else {
      newExpanded.add(tier)
    }
    setExpandedTiers(newExpanded)
  }

  const getTierIcon = (tier: SystemTier) => {
    switch (tier) {
      case SystemTier.SURVIVAL:
        return AlertTriangle
      case SystemTier.STABILITY:
        return Shield
      case SystemTier.GROWTH:
        return TrendingUp
      case SystemTier.LEVERAGE:
        return Zap
      case SystemTier.EXPRESSION:
        return Sparkles
      case SystemTier.CROSS_SYSTEM_STATES:
        return Network
      default:
        return Shield
    }
  }

  const getTierItems = (tier: SystemTier) => {
    return items.filter(item => getItemTier(item) === tier)
  }

  const handleItemClick = (item: TierItem) => {
    if (onItemClick) {
      onItemClick(item)
    } else if (item.route && item.status !== 'coming-soon') {
      navigate(item.route)
    }
  }

  const getRequiredTiers = (tier: SystemTier): SystemTier[] => {
    switch (tier) {
      case SystemTier.STABILITY:
        return [SystemTier.SURVIVAL]
      case SystemTier.GROWTH:
        return [SystemTier.SURVIVAL, SystemTier.STABILITY]
      case SystemTier.LEVERAGE:
        return [SystemTier.SURVIVAL, SystemTier.STABILITY, SystemTier.GROWTH]
      case SystemTier.EXPRESSION:
        return [SystemTier.SURVIVAL, SystemTier.STABILITY, SystemTier.GROWTH]
      default:
        return []
    }
  }

  const tierOrder: SystemTier[] = [
    SystemTier.SURVIVAL,
    SystemTier.STABILITY,
    SystemTier.GROWTH,
    SystemTier.LEVERAGE,
    SystemTier.EXPRESSION,
    SystemTier.CROSS_SYSTEM_STATES,
  ]

  // Label extraction and RAG classification
  const extractLabels = (item: TierItem): Array<{ text: string; color: 'green' | 'amber' | 'red'; type: 'domain' | 'metadata' }> => {
    const labels: Array<{ text: string; color: 'green' | 'amber' | 'red'; type: 'domain' | 'metadata' }> = []
    
    // Domain labels (extract from name, description, tags)
    const domainKeywords: Record<string, string> = {
      'health': 'Health',
      'money': 'Money',
      'energy': 'Energy',
      'investment': 'Investment',
      'travel': 'Travel',
      'training': 'Training',
      'knowledge': 'Knowledge',
      'meaning': 'Meaning',
      'analytics': 'Analytics',
      'settings': 'Settings',
    }
    
    const searchText = `${item.name} ${item.description} ${item.tags?.join(' ') || ''}`.toLowerCase()
    
    // Extract domain labels
    for (const [key, label] of Object.entries(domainKeywords)) {
      if (searchText.includes(key)) {
        labels.push({ text: label, color: 'green', type: 'domain' })
      }
    }
    
    // Metadata labels - positive indicators (green)
    const positivePatterns: Array<{ pattern: RegExp; label: string }> = [
      { pattern: /optimiz/i, label: 'Optimized' },
      { pattern: /growth|growing|expanding/i, label: 'Growth' },
      { pattern: /active|operational|running/i, label: 'Active' },
      { pattern: /stable|stability/i, label: 'Stable' },
      { pattern: /efficient|efficiency/i, label: 'Efficient' },
      { pattern: /improving|improved/i, label: 'Improving' },
      { pattern: /healthy|health/i, label: 'Healthy' },
      { pattern: /balanced|balance/i, label: 'Balanced' },
    ]
    
    // Metadata labels - negative indicators (red)
    const negativePatterns: Array<{ pattern: RegExp; label: string }> = [
      { pattern: /no\s+optimiz|not\s+optimiz|lack\s+of\s+optimiz/i, label: 'No Optimization' },
      { pattern: /no\s+growth|not\s+growing|stagnant|stagnation/i, label: 'No Growth' },
      { pattern: /decay|decaying|declining|decline/i, label: 'Decay' },
      { pattern: /burnout|burned\s+out/i, label: 'Burnout Risk' },
      { pattern: /fragile|fragility|unstable/i, label: 'Fragile' },
      { pattern: /depleted|depletion|low|insufficient/i, label: 'Depleted' },
      { pattern: /at\s+risk|risk|vulnerable/i, label: 'At Risk' },
      { pattern: /imbalance|imbalanced|unbalanced/i, label: 'Imbalanced' },
    ]
    
    // Metadata labels - warning indicators (amber)
    const warningPatterns: Array<{ pattern: RegExp; label: string }> = [
      { pattern: /moderate|moderately/i, label: 'Moderate' },
      { pattern: /partial|partially/i, label: 'Partial' },
      { pattern: /pending|in\s+progress/i, label: 'In Progress' },
      { pattern: /needs\s+attention|attention\s+needed/i, label: 'Needs Attention' },
      { pattern: /limited|limitation/i, label: 'Limited' },
      { pattern: /coming\s+soon/i, label: 'Coming Soon' },
    ]
    
    // Check for positive patterns
    for (const { pattern, label } of positivePatterns) {
      if (pattern.test(searchText) && !labels.some(l => l.text === label)) {
        labels.push({ text: label, color: 'green', type: 'metadata' })
      }
    }
    
    // Check for negative patterns
    for (const { pattern, label } of negativePatterns) {
      if (pattern.test(searchText) && !labels.some(l => l.text === label)) {
        labels.push({ text: label, color: 'red', type: 'metadata' })
      }
    }
    
    // Check for warning patterns
    for (const { pattern, label } of warningPatterns) {
      if (pattern.test(searchText) && !labels.some(l => l.text === label)) {
        labels.push({ text: label, color: 'amber', type: 'metadata' })
      }
    }
    
    return labels
  }

  // Default item renderer
  const defaultRenderItem = (item: TierItem, index: number) => {
    const ItemIcon = item.icon
    const labels = extractLabels(item)
    
    const getLabelColorClasses = (color: 'green' | 'amber' | 'red') => {
      switch (color) {
        case 'green':
          return 'bg-green-500/20 text-green-400 border-green-500/30'
        case 'amber':
          return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        case 'red':
          return 'bg-red-500/20 text-red-400 border-red-500/30'
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }
    }
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => handleItemClick(item)}
        className={`bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all hover:scale-105 ${
          item.status === 'active' || !item.status
            ? `${item.bgColor} hover:border-opacity-60`
            : 'border-gray-700 opacity-60 cursor-not-allowed'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${item.bgColor}`}>
            <ItemIcon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {item.status === 'coming-soon' && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/30">
                Coming Soon
              </span>
            )}
            {item.status === 'active' && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                Active
              </span>
            )}
          </div>
        </div>
        <h4 className="text-lg font-semibold text-white mb-1">
          {item.name}
        </h4>
        {item.mantra && (
          <p className={`text-sm mb-2 italic ${item.color}`}>
            "{item.mantra}"
          </p>
        )}
        <p className="text-gray-400 text-sm mb-3">
          {item.description}
        </p>
        
        {/* Labels Section */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {labels.map((label, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 text-xs rounded border font-medium ${getLabelColorClasses(label.color)}`}
                title={label.type === 'domain' ? 'Domain' : 'Status'}
              >
                {label.text}
              </span>
            ))}
          </div>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag, idx) => {
              const borderColor = item.bgColor.split(' ').find(cls => cls.startsWith('border-')) || 'border-gray-500/30'
              const bgColorOnly = item.bgColor.split(' ').find(cls => cls.startsWith('bg-')) || 'bg-gray-500/10'
              return (
                <span
                  key={idx}
                  className={`px-2 py-1 ${bgColorOnly} ${item.color} text-xs rounded border ${borderColor}`}
                >
                  {tag}
                </span>
              )
            })}
          </div>
        )}
      </motion.div>
    )
  }

  const renderItemFn = renderItem || defaultRenderItem

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      {title && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Tier Hierarchy */}
      <div className="space-y-6">
        {tierOrder.map((tier, tierIndex) => {
          const metadata = TIER_METADATA[tier]
          const tierItems = getTierItems(tier)
          const isExpanded = expandedTiers.has(tier)
          const requiredTiers = getRequiredTiers(tier)
          const TierIcon = getTierIcon(tier)

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: tierIndex * 0.1 }}
              className={`rounded-lg border-2 ${metadata.borderColor} ${metadata.bgColor} overflow-hidden`}
            >
              {/* Tier Header */}
              <button
                onClick={() => toggleTier(tier)}
                className="w-full p-6 text-left flex items-start justify-between hover:bg-opacity-20 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${metadata.bgColor} ${metadata.borderColor} border`}>
                    <TierIcon className={`w-6 h-6 ${metadata.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className={`text-2xl font-bold ${metadata.color}`}>
                        Tier {tierIndex}: {metadata.name}
                      </h2>
                      {requiredTiers.length > 0 && (
                        <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                          Requires: {requiredTiers.map(t => TIER_METADATA[t].name).join(', ')}
                        </span>
                      )}
                    </div>
                    <p className={`text-lg font-medium mb-2 ${metadata.color}`}>
                      {metadata.question}
                    </p>
                    <p className="text-gray-300 text-sm mb-3">
                      {metadata.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {metadata.characteristics.map((char, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded border border-gray-700"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {isExpanded ? (
                    <ChevronDown className={`w-6 h-6 ${metadata.color}`} />
                  ) : (
                    <ChevronRight className={`w-6 h-6 ${metadata.color}`} />
                  )}
                </div>
              </button>

              {/* Tier Items */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-700/50 bg-gray-900/50"
                >
                  {tierItems.length > 0 ? (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Items in this tier ({tierItems.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tierItems.map((item, itemIndex) => renderItemFn(item, itemIndex))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-400">No items in this tier yet.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Footer Note */}
      {showFooterNote && (
        <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          {footerNote || (
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Note:</strong> This hierarchy applies to ALL domains.
              Items can span multiple tiers. The tier view helps you understand priorities and dependencies.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

