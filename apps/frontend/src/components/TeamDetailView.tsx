import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Package, Users, BookOpen, Info, Shield, Calculator, BarChart3, TrendingUp, ChevronRight, ChevronDown, ChevronUp, Lock, ExternalLink, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Team, Product, Guide, Agent } from '../services/financeApi'
import { teamsApi, productsApi, guidesApi, agentsApi } from '../services/financeApi'
import EmergencyFundTracker from './EmergencyFundTracker'
import BudgetBuilderTracker from './BudgetBuilderTracker'
import CashFlowAnalyzer from './CashFlowAnalyzer'
import AgentDetailCard from './AgentDetailCard'
import DomainTag, { DomainTagList, BibleLawDomain } from './DomainTag'
import { getMasterProductRoute } from '../config/routes'
import { MasterDomain } from '../types'

interface TeamDetailViewProps {
  team: Team
  onClose: () => void
}

type TeamDetailTab = 'overview' | 'products' | 'agents' | 'guides'

/**
 * TeamDetailView Component
 * 
 * Amazon-style console view for team details with tabs:
 * - Overview: Team information and stats
 * - Products: Team products (calculators, trackers, analyzers)
 * - Agents: Team members
 * - Guides: Team workflows and guides
 */
export default function TeamDetailView({ team, onClose }: TeamDetailViewProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TeamDetailTab>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadTeamData()
  }, [team.id])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      
      // RESILIENCE: Load products independently with fallback to all products
      // Products are owned by organization, so they remain available even if team data fails
      let productsRes = { products: [] }
      try {
        productsRes = await productsApi.list(team.id)
      } catch (productError) {
        console.warn(`⚠️  Failed to load products for team ${team.id}, trying all products as fallback:`, productError)
        // Fallback: Try to load all products (products are independent of teams)
        try {
          productsRes = await productsApi.list()
        } catch (fallbackError) {
          console.error('❌ Failed to load products even with fallback:', fallbackError)
          // Continue with empty products array - UI will handle gracefully
        }
      }
      
      // Load guides and team details (these can fail independently)
      const [guidesRes, teamDetailRes] = await Promise.allSettled([
        guidesApi.list(undefined, team.id),
        teamsApi.get(team.id),
      ])
      
      setProducts(productsRes.products || [])
      setGuides(
        guidesRes.status === 'fulfilled' ? (guidesRes.value.guides || []) : []
      )
      
      // Load team agents if team detail includes agents
      if (teamDetailRes.status === 'fulfilled' && teamDetailRes.value?.agents) {
        // Fetch full agent details for each agent in the team
        const agentDetails = await Promise.allSettled(
          teamDetailRes.value.agents.map((teamAgent: any) =>
            agentsApi.get(teamAgent.id)
          )
        )
        setAgents(
          agentDetails
            .filter((result): result is PromiseFulfilledResult<Agent> => 
              result.status === 'fulfilled' && result.value !== null
            )
            .map(result => result.value)
        )
      } else {
        setAgents([])
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load team data'
      console.error('❌ Error loading team data:', {
        error,
        errorMessage,
        teamId: team.id,
        teamName: team.name,
        timestamp: new Date().toISOString(),
      })
      // RESILIENCE: Don't throw - allow UI to render with whatever data we have
      // Products especially should remain available even if team data fails
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview' as TeamDetailTab, label: 'Overview', icon: Info },
    { id: 'products' as TeamDetailTab, label: 'Products', icon: Package, count: products.length },
    { id: 'agents' as TeamDetailTab, label: 'Agents', icon: Users, count: agents.length },
    { id: 'guides' as TeamDetailTab, label: 'Guides', icon: BookOpen, count: guides.length },
  ]

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'CALCULATOR':
        return Calculator
      case 'TRACKER':
        return TrendingUp
      case 'ANALYZER':
        return BarChart3
      case 'DASHBOARD':
        return BarChart3
      case 'PLANNER':
        return BookOpen
      default:
        return Package
    }
  }

  const getSecurityLevelColor = (level?: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      case 'MEDIUM':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      case 'LOW':
        return 'bg-green-500/10 border-green-500/30 text-green-400'
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400'
    }
  }

  const renderProduct = (product: Product) => {
    // Render specific product components
    if (product.name === 'Emergency Fund Tracker') {
      return <EmergencyFundTracker key={product.id} />
    }
    if (product.name === 'Budget Builder & Tracker') {
      return <BudgetBuilderTracker key={product.id} />
    }
    if (product.name === 'Cash Flow Analyzer') {
      return <CashFlowAnalyzer key={product.id} />
    }

    // Generic product card for other products
    const IconComponent = getProductIcon(product.type)
    const securityColor = getSecurityLevelColor(product.securityLevel)
    
    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            {product.icon ? (
              <span className="text-2xl">{product.icon}</span>
            ) : (
              <IconComponent className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              {product.securityLevel && (
                <span className={`px-2 py-1 rounded text-xs font-medium border ${securityColor}`}>
                  <Lock className="w-3 h-3 inline mr-1" />
                  {product.securityLevel}
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-4">{product.description}</p>
            
            {/* Security Information */}
            {product.security && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-gray-300">Security & Compliance</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  {product.security.complianceStandards && product.security.complianceStandards.length > 0 && (
                    <div>
                      <span className="text-gray-500">Compliance: </span>
                      {product.security.complianceStandards.join(', ')}
                    </div>
                  )}
                  {product.security.encryptionAtRest && product.security.encryptionInTransit && (
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-green-400" />
                      <span>Encrypted at rest & in transit</span>
                    </div>
                  )}
                  {product.security.authenticationMethod && (
                    <div>
                      <span className="text-gray-500">Auth: </span>
                      {product.security.authenticationMethod}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Access - Navigate to single product view */}
            <div className="mb-4">
              <button
                onClick={() => {
                  // Navigate to single product view
                  navigate(getMasterProductRoute(MasterDomain.MONEY, product.id))
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                <span>Open Product</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              {product.requiresAuth && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Authentication required
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                {product.type}
              </span>
              {product.features && Array.isArray(product.features) && (
                <span className="text-sm text-gray-500">
                  {product.features.length} features
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{team.icon || '👥'}</div>
              <div>
                <h2 className="text-2xl font-bold">{team.name}</h2>
                <p className="text-gray-400 text-sm">{team.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-800/50">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Team Information</h3>
                      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                        {/* Domain */}
                        <div>
                          <span className="text-gray-400 text-sm mb-2 block">Domain</span>
                          <DomainTag 
                            domain={team.domain} 
                            size="md"
                          />
                        </div>

                        {/* Products - Collapsible */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Products</span>
                            <span className="text-gray-500 text-sm">{products.length} available</span>
                          </div>
                          {products.length > 0 ? (
                            <div className="space-y-2">
                              {products.map((product) => {
                                const isExpanded = expandedProducts.has(product.id)
                                return (
                                  <div
                                    key={product.id}
                                    className="bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden"
                                  >
                                    {/* Product Header - Always Visible */}
                                    <div
                                      className="p-3 cursor-pointer hover:bg-gray-700 transition-colors group"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setExpandedProducts(prev => {
                                          const newSet = new Set(prev)
                                          if (isExpanded) {
                                            newSet.delete(product.id)
                                          } else {
                                            newSet.add(product.id)
                                          }
                                          return newSet
                                        })
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                          {product.icon ? (
                                            <span className="text-xl">{product.icon}</span>
                                          ) : (
                                            <Package className="w-5 h-5 text-gray-400" />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                              <h4 className="font-medium text-sm">{product.name}</h4>
                                              {product.securityLevel && (
                                                <span className={`px-1.5 py-0.5 rounded text-xs border ${getSecurityLevelColor(product.securityLevel)}`}>
                                                  <Lock className="w-2.5 h-2.5 inline mr-0.5" />
                                                  {product.securityLevel}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                              {product.description}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                          ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Product Details - Expandable */}
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-gray-600"
                                      >
                                        <div className="p-4 space-y-3">
                                          <p className="text-sm text-gray-300">{product.description}</p>
                                          
                                          {/* Product Type */}
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Type:</span>
                                            <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                              {product.type}
                                            </span>
                                          </div>

                                          {/* Security Information */}
                                          {product.security && (
                                            <div className="bg-gray-600/50 rounded-lg p-3">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Shield className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm font-semibold text-gray-300">Security</span>
                                              </div>
                                              <div className="space-y-1 text-xs text-gray-400">
                                                {product.security.complianceStandards && product.security.complianceStandards.length > 0 && (
                                                  <div>
                                                    <span className="text-gray-500">Compliance: </span>
                                                    {product.security.complianceStandards.join(', ')}
                                                  </div>
                                                )}
                                                {product.security.encryptionAtRest && product.security.encryptionInTransit && (
                                                  <div className="flex items-center gap-1">
                                                    <Lock className="w-3 h-3 text-green-400" />
                                                    <span>Encrypted at rest & in transit</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* Features Preview */}
                                          {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                                            <div>
                                              <span className="text-xs text-gray-500">Features: </span>
                                              <span className="text-xs text-gray-400">
                                                {product.features.length} feature{product.features.length !== 1 ? 's' : ''} available
                                              </span>
                                            </div>
                                          )}

                                          {/* Open Product Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              navigate(getMasterProductRoute(MasterDomain.MONEY, product.id))
                                            }}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                                          >
                                            <span>Open Product</span>
                                            <ChevronRight className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No products available</p>
                          )}
                        </div>

                        {/* Guides */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Guides</span>
                            <span className="text-gray-500 text-sm">{guides.length} available</span>
                          </div>
                          {guides.length > 0 ? (
                            <div className="space-y-2">
                              {guides.map((guide) => (
                                <div
                                  key={guide.id}
                                  className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors group"
                                  onClick={() => setActiveTab('guides')}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <BookOpen className="w-5 h-5 text-gray-400" />
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm">{guide.title}</h4>
                                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                          {guide.description}
                                        </p>
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No guides available</p>
                          )}
                        </div>

                        {/* Agents */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Agents</span>
                            <span className="text-gray-500 text-sm">{agents.length} available</span>
                          </div>
                          {agents.length > 0 ? (
                            <div className="space-y-2">
                              {agents.map((agent) => (
                                <div
                                  key={agent.id}
                                  className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors group"
                                  onClick={() => setActiveTab('agents')}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      {agent.avatar ? (
                                        <span className="text-xl">{agent.avatar}</span>
                                      ) : (
                                        <Users className="w-5 h-5 text-gray-400" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm">{agent.name}</h4>
                                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                          {agent.expertise}
                                        </p>
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No agents assigned to this team</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    {products.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No products available for this team</p>
                      </div>
                    ) : (
                      products.map((product) => renderProduct(product))
                    )}
                  </div>
                )}

                {/* Agents Tab */}
                {activeTab === 'agents' && (
                  <div>
                    {agents.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No agents available for this team</p>
                        <p className="text-sm mt-2">Agent data will be loaded here</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agents.map((agent) => (
                          <AgentDetailCard key={agent.id} agent={agent} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Guides Tab */}
                {activeTab === 'guides' && (
                  <div>
                    {guides.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No guides available for this team</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {guides.map((guide) => (
                          <div
                            key={guide.id}
                            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{guide.title}</h4>
                                <p className="text-sm text-gray-400 mb-2">{guide.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Difficulty: {guide.difficulty}/5</span>
                                  {guide.estimatedTime && (
                                    <span>{guide.estimatedTime} min</span>
                                  )}
                                  <span className="px-2 py-0.5 bg-gray-700 rounded">
                                    {guide.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

