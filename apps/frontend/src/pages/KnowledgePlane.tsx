/**
 * Knowledge Plane Dashboard
 * 
 * Read-only, interpretive systems for understanding the world.
 * No energy consumption, no state mutations, no consequences.
 */

import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Eye, Settings, ChevronRight, ChevronDown, Sparkles, Search, Target, Layers, Lock, Menu, X, Star, StarOff, Filter, DollarSign, Wrench, Package, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import LawsView from '../components/knowledge/LawsView'
import DomainLawsView from '../components/DomainLawsView'
import MasterMeaning from './MasterMeaning'
import MasterFinanceKnowledge from './MasterFinanceKnowledge'
import KnowledgeSearch from '../components/knowledge/KnowledgeSearch'
import HierarchyTreeView from '../components/knowledge/HierarchyTreeView'
import RootNodeModal from '../components/knowledge/RootNodeModal'
import ArtifactsView from '../components/ArtifactsView'
import GlossaryView from '../components/knowledge/GlossaryView'
import { realityNodeApi, type RealityNode, type RealityNodeHierarchy } from '../services/financeApi'
import { MasterDomain } from '../types'
import { logger } from '../lib/logger'

export default function KnowledgePlane() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Determine current section from pathname
  const getCurrentSection = () => {
    const path = location.pathname
    if (path === '/knowledge' || path === '/knowledge/') {
      return 'planes' // Show plane selection at root
    }
    const section = path.split('/').pop()
    return section || 'planes'
  }
  
  const currentSection = getCurrentSection()
  const [activeSection, setActiveSection] = useState<string>(currentSection)
  const [selectedRootNode, setSelectedRootNode] = useState<RealityNodeHierarchy | null>(null)
  const [isRootModalOpen, setIsRootModalOpen] = useState(false)
  const [realityNode, setRealityNode] = useState<RealityNode | null>(null)
  const [constraintsNode, setConstraintsNode] = useState<RealityNode | null>(null)
  const [lawsNode, setLawsNode] = useState<RealityNode | null>(null)
  const [principlesNode, setPrinciplesNode] = useState<RealityNode | null>(null)
  const [frameworksNode, setFrameworksNode] = useState<RealityNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false) // Start expanded
  const [savedSystem, setSavedSystem] = useState<string | null>(() => {
    // Load saved system from localStorage, default to 'finance' (Finance System)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('knowledgePlane_savedSystem') || 'finance'
    }
    return 'finance'
  })
  const [showFocusSystemModal, setShowFocusSystemModal] = useState(false)

  useEffect(() => {
    const section = getCurrentSection()
    setActiveSection(section)
  }, [location.pathname])

  // Save system preference
  const handleSaveSystem = (systemId: string) => {
    setSavedSystem(systemId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('knowledgePlane_savedSystem', systemId)
    }
  }

  // Remove saved system
  const handleRemoveSavedSystem = () => {
    setSavedSystem(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('knowledgePlane_savedSystem')
    }
  }

  // Load root nodes data
  useEffect(() => {
    const loadRootNodes = async () => {
      try {
        setLoading(true)
        // Load REALITY root
        const realityResponse = await realityNodeApi.getNode('reality-root')
        setRealityNode(realityResponse.node)

        // Load CONSTRAINTS_OF_REALITY
        const constraintsResponse = await realityNodeApi.getNode('constraints-of-reality')
        setConstraintsNode(constraintsResponse.node)

        // Load LAWS, PRINCIPLES, FRAMEWORKS
        const lawsResponse = await realityNodeApi.getNode('laws-node')
        setLawsNode(lawsResponse.node)

        const principlesResponse = await realityNodeApi.getNode('principles-node')
        setPrinciplesNode(principlesResponse.node)

        const frameworksResponse = await realityNodeApi.getNode('frameworks-node')
        setFrameworksNode(frameworksResponse.node)
      } catch (error) {
        logger.error('Error loading root nodes', error instanceof Error ? error : new Error(String(error)))
      } finally {
        setLoading(false)
      }
    }

    // Load root nodes for constraints section
    if (activeSection === 'constraints') {
      loadRootNodes()
    }
  }, [activeSection])

  // Navigate to a node (load its hierarchy and open modal)
  const handleNavigateToNode = async (nodeId: string) => {
    try {
      const hierarchy = await realityNodeApi.getHierarchy(nodeId)
      setSelectedRootNode(hierarchy)
      setIsRootModalOpen(true)
    } catch (error) {
      logger.error('Error loading node hierarchy', error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Open node modal with hierarchy
  const handleOpenNode = async (nodeId: string) => {
    await handleNavigateToNode(nodeId)
  }

  // Section interface
  interface KnowledgeSection {
    id: string
    name: string
    icon: typeof Search
    description: string
    route: string
    isPreset: boolean
    systemRoute?: string
    isDefaultSaved?: boolean
  }

  // Preset filters - ordered as specified
  const presetFilters: KnowledgeSection[] = [
    {
      id: 'search',
      name: 'Search',
      icon: Search,
      description: 'Search across all knowledge content',
      route: '/knowledge/search',
      isPreset: true,
    },
    {
      id: 'constraints',
      name: 'Constraints of Reality',
      icon: Target,
      description: 'constraints of reality',
      route: '/knowledge/constraints',
      isPreset: true,
    },
    {
      id: 'meaning',
      name: 'Meaning System',
      icon: Sparkles,
      description: 'Purpose, values alignment, and Awareness Layers',
      route: '/knowledge/meaning',
      systemRoute: '/master/meaning', // System home page when focused
      isPreset: true,
    },
    {
      id: 'finance',
      name: 'Finance System',
      icon: DollarSign,
      description: 'Financial laws, principles, and frameworks',
      route: '/knowledge/finance',
      systemRoute: '/master/finance', // System home page when focused
      isPreset: true,
      isDefaultSaved: true, // Default saved system
    },
  ]

  // Additional sections (not in preset filters)
  const additionalSections: KnowledgeSection[] = [
    {
      id: 'overview',
      name: 'Reality',
      icon: Layers,
      description: 'Full hierarchical view of all laws, principles, and frameworks',
      route: '/knowledge/overview',
      isPreset: false,
    },
    {
      id: 'laws',
      name: 'Laws, Principles & Frameworks',
      icon: BookOpen,
      description: '48 Laws of Power, Bible Laws, Principles, and strategic frameworks',
      route: '/knowledge/laws',
      isPreset: false,
    },
    {
      id: 'artifacts',
      name: 'Artifacts',
      icon: Package,
      description: 'All viewable entities: Resources, Stats, Concepts, Laws, Principles, Frameworks, and Weapons. Systems contain artifacts.',
      route: '/knowledge/artifacts',
      isPreset: false,
    },
    {
      id: 'glossary',
      name: 'Glossary',
      icon: Info,
      description: 'Comprehensive reference for all key terms, concepts, and game mechanics',
      route: '/knowledge/glossary',
      isPreset: false,
    },
  ]

  const allSections = [...presetFilters, ...additionalSections]

  // Get dynamic title based on active section
  const getPageTitle = () => {
    const section = allSections.find(s => s.id === activeSection)
    return section ? section.name : 'Knowledge'
  }

  // Get saved system display name
  const getSavedSystemName = () => {
    if (!savedSystem) return null
    const system = allSections.find(s => s.id === savedSystem)
    return system ? system.name : null
  }

  // Check if we're on a specific view (not the landing page)
  const isInView = activeSection !== 'planes' && location.pathname !== '/knowledge' && location.pathname !== '/knowledge/'
  
  // If on landing page, show plane selection
  if (!isInView) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Knowledge</h1>
          </div>
        </div>

        {/* Knowledge Planes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {allSections.map((section) => {
            const Icon = section.icon
            const isSaved = savedSystem === section.id
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => {
                  // If focused/saved and has systemRoute, navigate to system home
                  if (isSaved && section.systemRoute) {
                    navigate(section.systemRoute)
                  } else if (section.route) {
                    navigate(section.route)
                  }
                }}
                className={`bg-gray-800 rounded-lg p-8 border-2 cursor-pointer transition-all hover:scale-105 group flex flex-col h-full ${
                  isSaved
                    ? 'border-yellow-500/50 hover:border-yellow-500/80'
                    : 'border-blue-500/30 hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${isSaved ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                    <Icon className={`w-8 h-8 ${isSaved ? 'text-yellow-400' : 'text-blue-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-2xl font-bold transition-colors ${
                        isSaved ? 'text-yellow-300 group-hover:text-yellow-200' : 'text-white group-hover:text-blue-400'
                      }`}>
                        {section.name}
                      </h3>
                      {isSaved && <Star className="w-5 h-5 text-yellow-400 fill-current" />}
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 flex-grow">
                  {section.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className={`${isSaved ? 'text-yellow-400' : 'text-blue-400'} group-hover:translate-x-2 transition-transform flex items-center gap-2`}>
                    Enter plane
                    <ChevronRight className="w-4 h-4" />
                  </span>
                  {isSaved && section.systemRoute && (
                    <span className="text-xs text-yellow-400/70 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Focused System
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Otherwise, show the selected view with header
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(activeSection === 'artifacts' ? '/choose-plane' : '/knowledge')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title={activeSection === 'artifacts' ? 'Back to home' : 'Back to Knowledge Planes'}
            >
              <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
            </button>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{getPageTitle()}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Focus System Tool Button - More Prominent */}
            <button
              onClick={() => setShowFocusSystemModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all group ${
                savedSystem
                  ? 'bg-yellow-500/10 border-yellow-500/50 hover:border-yellow-500/80'
                  : 'bg-gray-800 border-gray-700 hover:border-blue-500/50'
              }`}
              title="Change focused system"
            >
              {savedSystem ? (
                <>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-yellow-300 group-hover:text-yellow-200">
                    {getSavedSystemName()}
                  </span>
                  <Wrench className="w-3 h-3 text-yellow-400/70 group-hover:text-yellow-300 transition-colors" />
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    Set Focus
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* Content Area - Wrapped in consistent container */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {activeSection === 'search' && (
          <KnowledgeSearch 
            initialQuery={location.state?.query || ''} 
          />
        )}
        {activeSection === 'overview' && (
          <HierarchyTreeView />
        )}
        {activeSection === 'meaning' && <MasterMeaning />}
        {activeSection === 'laws' && <LawsView />}
        {activeSection === 'finance' && <MasterFinanceKnowledge />}
        {activeSection === 'artifacts' && <ArtifactsView />}
        {activeSection === 'glossary' && <GlossaryView />}
        {activeSection === 'constraints' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Constraints of Reality</h2>
            <p className="text-gray-400 mb-6">
              View the complete hierarchy of constraints of reality.
            </p>
            <HierarchyTreeView rootNodeId="constraints" />
          </div>
        )}
      </div>

      {/* Root Node Modal */}
      {selectedRootNode && (
        <RootNodeModal
          node={selectedRootNode}
          isOpen={isRootModalOpen}
          onClose={() => {
            setIsRootModalOpen(false)
            setSelectedRootNode(null)
          }}
          onNavigateToNode={handleNavigateToNode}
        />
      )}

      {/* Focus System Selection Modal - Improved UX */}
      {showFocusSystemModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setShowFocusSystemModal(false)}
        >
          <div 
            className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-700 max-w-[95vw] sm:max-w-2xl lg:max-w-4xl w-full shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </div>
                  Select Focus System
                </h2>
                <p className="text-gray-400">
                  Choose a system to focus on. This will be saved as your default view and highlighted throughout the interface.
                </p>
              </div>
              <button
                onClick={() => setShowFocusSystemModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {allSections.map((section) => {
                const Icon = section.icon
                const isSelected = savedSystem === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      handleSaveSystem(section.id)
                      setShowFocusSystemModal(false)
                    }}
                    className={`p-5 rounded-lg border-2 transition-all text-left group relative ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                        : 'border-gray-700 hover:border-yellow-500/50 bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg ${
                        isSelected ? 'bg-yellow-500/20' : 'bg-gray-600/50'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isSelected ? 'text-yellow-400' : 'text-gray-400 group-hover:text-yellow-400'
                        }`} />
                      </div>
                      {isSelected && (
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      isSelected ? 'text-yellow-300' : 'text-white'
                    }`}>
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-400">{section.description}</p>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  handleRemoveSavedSystem()
                  setShowFocusSystemModal(false)
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Focus
              </button>
              <button
                onClick={() => setShowFocusSystemModal(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

