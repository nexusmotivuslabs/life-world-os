/**
 * Tier View
 * 
 * Displays all systems organized by the universal tier hierarchy system.
 * Uses GenericTierView as a template to show systems by tier.
 * Includes tabs to switch between Tier View, List View, and Artifacts.
 */

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layers, List, Sparkles, GitBranch } from 'lucide-react'
import { systems } from '../components/ExploreSystems'
import ExploreSystems from '../components/ExploreSystems'
import ArtifactsView from '../components/ArtifactsView'
import HierarchyTreeView from '../components/knowledge/HierarchyTreeView'
import GenericTierView, { TierItem } from '../components/GenericTierView'
import { SystemTier } from '../types'
import { realityNodeApi } from '../services/financeApi'

type ViewMode = 'tiers' | 'list' | 'artifacts' | 'tree'

interface TierViewProps {
  defaultViewMode?: ViewMode
}

export default function TierView({ defaultViewMode = 'list' }: TierViewProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Set up periodic refresh for tree view (every 30 seconds)
  useEffect(() => {
    if (viewMode === 'tree') {
      const interval = setInterval(() => {
        setRefreshTrigger(prev => prev + 1)
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [viewMode])

  // Sync viewMode with route
  useEffect(() => {
    if (location.pathname === '/systems/tiers') {
      setViewMode('tiers')
    } else if (location.pathname === '/systems/list' || location.pathname === '/systems') {
      // /systems defaults to list view
      setViewMode('list')
    } else if (location.pathname === '/systems/artifacts') {
      setViewMode('artifacts')
    } else if (location.pathname === '/systems/tree') {
      setViewMode('tree')
    } else if (location.pathname === '/tiers') {
      // Legacy route - keep existing behavior
      if (defaultViewMode) {
        setViewMode(defaultViewMode)
      }
    }
  }, [location.pathname, defaultViewMode])

  // Handle view mode changes - navigate to appropriate route
  const handleViewModeChange = (newMode: ViewMode) => {
    // Update view mode immediately for responsive UI
    setViewMode(newMode)
    
    // Navigate to the appropriate route
    if (newMode === 'tiers') {
      navigate('/systems/tiers', { replace: true })
    } else if (newMode === 'list') {
      navigate('/systems/list', { replace: true })
    } else if (newMode === 'artifacts') {
      navigate('/systems/artifacts', { replace: true })
    } else if (newMode === 'tree') {
      navigate('/systems/tree', { replace: true })
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-bold">System Tiers</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Navigate systems organized by the universal tier hierarchy: Survival, Stability, Growth, Leverage, Expression
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Switch between Tier View, List View, System Tree, and Artifacts to explore all available systems
        </p>
      </div>


      {/* Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              viewMode === 'list'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" />
              <span>List View</span>
            </div>
            {viewMode === 'list' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => handleViewModeChange('tiers')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              viewMode === 'tiers'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Tier View</span>
            </div>
            {viewMode === 'tiers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => handleViewModeChange('artifacts')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              viewMode === 'artifacts'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Artifacts</span>
            </div>
            {viewMode === 'artifacts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => handleViewModeChange('tree')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              viewMode === 'tree'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>System Tree</span>
            </div>
            {viewMode === 'tree' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      {viewMode === 'list' ? (
        <ExploreSystems searchQuery={searchQuery} />
      ) : viewMode === 'artifacts' ? (
        <ArtifactsView />
      ) : viewMode === 'tree' ? (
        <HierarchyTreeView 
          rootNodeId="constraints-of-reality" 
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <div className="overflow-auto max-h-[calc(100vh-400px)]">
          <GenericTierView
            title="System Tiers"
            description="Universal system hierarchy: Survival, Stability, Growth, Leverage, Expression, and Cross-System States"
            items={systems as TierItem[]}
            getItemTier={(item) => item.tier}
            footerNote={
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Note:</strong> This hierarchy applies to ALL domains.
                Systems can span multiple tiers (e.g., Money System has both Tier 1 stability aspects and Tier 3 leverage aspects).
                The tier view helps you understand system priorities and dependencies.
              </p>
            }
          />
        </div>
      )}
    </div>
  )
}

