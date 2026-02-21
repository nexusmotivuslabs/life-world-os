/**
 * Explore Systems Dashboard
 * 
 * Central dashboard component that consolidates access to all systems
 * in the Life World OS application.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Zap, 
  BookOpen,
  ChevronRight,
  Search,
  X,
  MapPin,
  HeartPulse,
  Clock,
  Shield,
  Award,
  Network,
  Battery,
  Briefcase,
  Users
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getMasterRoute } from '../config/routes'
import { MasterDomain, SystemTier } from '../types'
import { getReleaseStatus } from '../config/releaseStatus'
import { ReleaseStatus, getReleaseStatusLabel, getReleaseStatusColor, isFeatureSelectable } from '../types/release'

interface System {
  id: string
  name: string
  mantra: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  route: string
  color: string
  bgColor: string
  status: 'active' | 'coming-soon'
  tags?: string[]
  plane?: 'knowledge' | 'systems' | 'both'
  tier: SystemTier
}

export const systems: System[] = [
  {
    id: 'master-finance',
    name: 'Finance',
    mantra: 'Cash flow is oxygen. Buffers are armor.',
    description: 'Financial guidance with AI agents, domain teams, and interactive products',
    icon: DollarSign,
    route: getMasterRoute(MasterDomain.FINANCE),
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/30',
    status: 'active',
    tier: SystemTier.STABILITY,
    tags: [
      '7 Expert AI Agents',
      '8 Domain Teams',
      '17 Financial Products',
      'Security Specialist',
      'Guided Workflows'
    ],
  },
  {
    id: 'investments',
    name: 'Investment',
    mantra: 'Compound time, not just money.',
    description: 'Portfolio management, rebalancing, and investment strategies',
    icon: TrendingUp,
    route: '/systems', // Investment features are in Systems Plane
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    status: 'coming-soon', // V2 Release - Coming Soon
    plane: 'systems',
    tier: SystemTier.GROWTH,
    tags: [
      'Portfolio Tracking',
      'Asset Allocation',
      'ROI Analysis',
      'Rebalancing Tools'
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    mantra: 'Energy is the currency of action.',
    description: 'Track and manage your energy levels and capacity',
    icon: Zap,
    route: getMasterRoute(MasterDomain.ENERGY),
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    status: 'active',
    plane: 'systems',
    tier: SystemTier.STABILITY,
    tags: [
      'Energy Tracking',
      'Capacity Management',
      'Energy Laws',
      'Weekly Ticks'
    ],
  },
  {
    id: 'health-capacity',
    name: 'Health',
    mantra: 'Capacity governs everything else.',
    description: 'Human operating stability: physical health, mental resilience, cognitive efficiency, and recovery elasticity',
    icon: HeartPulse,
    route: getMasterRoute(MasterDomain.HEALTH),
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/30',
    status: 'active',
    plane: 'systems',
    tier: SystemTier.CORE_TIER_0,
    tags: [
      'Capacity State Management',
      'Recovery Actions',
      'Effort-Based Decay',
      'Burnout Prevention',
      'Weekly Recovery System'
    ],
  },
  {
    id: 'career',
    name: 'Career',
    mantra: 'If career shakes but character is stable, you adapt.',
    description: 'Income generation, professional development, and strategic optionality. Engines, Trust, Reputation, Optionality.',
    icon: Briefcase,
    route: getMasterRoute(MasterDomain.CAREER),
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    status: 'active',
    plane: 'systems',
    tier: SystemTier.CORE_TIER_0,
    tags: [
      'Engines & Income',
      'Trust & Reputation',
      'Optionality',
      'Career Systems'
    ],
  },
  {
    id: 'relationships',
    name: 'Relationships',
    mantra: 'If relationship shakes but character is stable, you respond calmly.',
    description: 'Trust, reputation, and relational capital. Governs access to opportunities, partnerships, and resources.',
    icon: Users,
    route: getMasterRoute(MasterDomain.RELATIONSHIPS),
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/30',
    status: 'active',
    plane: 'systems',
    tier: SystemTier.CORE_TIER_0,
    tags: [
      'Trust',
      'Reputation',
      'Relational Capital',
      'Partnerships'
    ],
  },
  {
    id: 'master-travel',
    name: 'Travel',
    mantra: 'Location is optionality.',
    description: 'Find location alternatives and travel recommendations',
    icon: MapPin,
    route: getMasterRoute(MasterDomain.TRAVEL),
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    status: 'active',
    tier: SystemTier.EXPRESSION,
    tags: [
      'Google Places Integration',
      'Location Alternatives',
      'Save Locations',
      'Real-time Data'
    ],
  },
  {
    id: 'master-software',
    name: 'Software',
    mantra: 'Systems compound; clarity compounds.',
    description: 'Design, build, and operate software systems for tech practitioners',
    icon: Network,
    route: getMasterRoute(MasterDomain.SOFTWARE),
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/30',
    status: 'active',
    tier: SystemTier.LEVERAGE,
    tags: [
      'Architecture Patterns',
      'Delivery and DevOps',
      'Quality and Testing',
      'API Design'
    ],
  },
  {
    id: 'training',
    name: 'Training',
    mantra: 'Skills compound, habits compound.',
    description: 'Skill development and progression tracking',
    icon: Target,
    route: '/systems', // Training Center is in Systems Plane
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    status: 'coming-soon', // V2 Release - Coming Soon
    plane: 'systems',
    tier: SystemTier.GROWTH,
    tags: [
      'Skill Tracking',
      'Progress Monitoring',
      'Training Plans'
    ],
  },
  {
    id: 'master-meaning',
    name: 'Meaning',
    mantra: 'Purpose protects against decay.',
    description: 'Purpose, values alignment, and spiritual/psychological resilience. Includes Awareness Layers as interpretation context.',
    icon: BookOpen,
    route: '/knowledge/meaning',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    status: 'coming-soon', // V2 Release - Coming Soon
    plane: 'knowledge',
    tier: SystemTier.EXPRESSION,
    tags: [
      'Meaning State (0-100)',
      'Meaning Decay & Stability',
      'Direction & Alignment',
      'Awareness Layers (Root, Shadow, Pattern)'
    ],
  },
  {
    id: 'trust',
    name: 'Trust',
    mantra: 'Trust is a forward-looking belief.',
    description: 'Global modifier that affects multiple systems. Built on competence, reliability, and alignment. Low trust restricts opportunities and increases costs across all systems.',
    icon: Shield,
    route: '/systems/trust', // TODO: Create trust system page
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    status: 'active',
    plane: 'systems',
    tier: SystemTier.CROSS_SYSTEM_STATES,
    tags: [
      '3 Domain Teams',
      '9 Expert Agents',
      '6 Trust Products',
      'Trust Analyst',
      'Guided Workflows'
    ],
  },
  {
    id: 'reputation',
    name: 'Reputation',
    mantra: 'Reputation is not what people think of you. It is what they expect from you.',
    description: 'Cross-system state that governs access to opportunities, partnerships, and resources. Reputation compounds slowly but can be lost quickly through repeated violations.',
    icon: Award,
    route: '/systems/reputation', // TODO: Create reputation system page
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    status: 'active',
    plane: 'systems',
    tier: SystemTier.CROSS_SYSTEM_STATES,
    tags: [
      '3 Domain Teams',
      '9 Expert Agents',
      '6 Reputation Products',
      'Reputation Guardian',
      'Guided Workflows'
    ],
  },
  {
    id: 'optionality',
    name: 'Optionality',
    mantra: 'Optionality is the right, but not the obligation, to act.',
    description: 'Cross-system state representing available choices and strategic freedom. High optionality unlocks higher-risk, higher-reward actions across all systems.',
    icon: Network,
    route: '/systems/optionality', // TODO: Create optionality system page
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/30',
    status: 'active',
    plane: 'systems',
    tier: SystemTier.CROSS_SYSTEM_STATES,
    tags: [
      '3 Domain Teams',
      '9 Expert Agents',
      '6 Strategic Products',
      'Decision Analyst',
      'Guided Workflows'
    ],
  },
  {
    id: 'energy-reserve',
    name: 'Energy Reserve',
    mantra: 'Reserve energy enables sustained effort when needed.',
    description: 'Cross-system state representing stored energy capacity beyond daily budget. Enables sustained effort across multiple systems during critical periods.',
    icon: Battery,
    route: '/systems/energy-reserve', // TODO: Create energy reserve system page
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    status: 'coming-soon',
    plane: 'systems',
    tier: SystemTier.CROSS_SYSTEM_STATES,
    tags: [
      'Stored Energy',
      'Sustained Effort',
      'Critical Period Buffer',
      'Cross-System Capacity',
      'Emergency Reserve'
    ],
  },
]

interface ExploreSystemsProps {
  searchQuery?: string
}

export default function ExploreSystems({ searchQuery: externalSearchQuery }: ExploreSystemsProps = {}) {
  const navigate = useNavigate()
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>('active')
  
  // Use external search query if provided, otherwise use internal state
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery

  const filteredSystems = systems.filter(system => {
    const matchesSearch = !searchQuery.trim() || 
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.mantra?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || system.status === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSystemClick = (system: System) => {
    if (system.status === 'active') {
      navigate(system.route)
    }
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header - Only show if not embedded in TierView */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">Explore Systems</h1>
          </div>
          <p className="text-gray-400">
            Access all systems and features in Life World OS
          </p>
        </div>

        {/* Search - Always show search in list view */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search systems (e.g., money, energy, health)..."
              value={internalSearchQuery}
              onChange={(e) => setInternalSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-lg"
            />
            {internalSearchQuery && (
              <button
                onClick={() => setInternalSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('active')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'active'
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedCategory('coming-soon')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'coming-soon'
                  ? 'bg-yellow-600 border-yellow-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSystems.map((system, index) => {
            const Icon = system.icon
            // Get release info for this system
            const systemReleaseId = system.id === 'master-finance' ? 'finance' :
                                   system.id === 'energy' ? 'energy' :
                                   system.id === 'health-capacity' ? 'health' :
                                   system.id === 'master-software' ? 'software' :
                                   system.id === 'investments' ? 'investment' :
                                   system.id === 'training' ? 'training' :
                                   system.id === 'master-meaning' ? 'meaning' : null
            const releaseStatus = systemReleaseId ? getReleaseStatus(systemReleaseId) : null
            const statusColor = releaseStatus ? getReleaseStatusColor(releaseStatus) : null
            const isSelectable = system.status === 'active' && (!releaseStatus || isFeatureSelectable(releaseStatus))
            
            return (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => isSelectable && handleSystemClick(system)}
                className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
                  isSelectable
                    ? `${system.bgColor} hover:border-opacity-60 cursor-pointer hover:scale-105`
                    : 'border-gray-700 opacity-60 cursor-not-allowed'
                } relative`}
              >
                {/* Release Status Badge - Only show "Coming Soon" to users, "Live" is internal only */}
                {releaseStatus === ReleaseStatus.COMING_SOON && (
                  <div className={`absolute top-4 right-4 flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium ${statusColor?.bg} ${statusColor?.border} ${statusColor?.text}`}>
                    <Clock className="w-3 h-3" />
                    <span>{getReleaseStatusLabel(releaseStatus)}</span>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${system.bgColor}`}>
                    <Icon className={`w-6 h-6 ${system.color}`} />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-1">
                  {system.name}
                </h3>
                <p className={`text-sm mb-3 italic ${system.color}`}>
                  {system.mantra}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {system.description}
                </p>

                {system.tags && system.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {system.tags.map((tag, idx) => {
                        // Extract border color from bgColor (e.g., "bg-green-500/10 border-green-500/30" -> "border-green-500/30")
                        const borderColor = system.bgColor.split(' ').find(cls => cls.startsWith('border-')) || 'border-gray-500/30'
                        // Extract just the bg color part
                        const bgColorOnly = system.bgColor.split(' ').find(cls => cls.startsWith('bg-')) || 'bg-gray-500/10'
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-1 ${bgColorOnly} ${system.color} text-xs rounded border ${borderColor}`}
                          >
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                
                
                {!isSelectable && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <span className="text-sm text-gray-400">Coming soon</span>
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {filteredSystems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No systems found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

