/**
 * SystemHealthObservability Component
 * 
 * Reusable system health component with navigation for:
 * - Observability: Overall system health, metrics, trends
 * - Components: Individual component status
 * - Dependencies: External dependencies (API keys, third-party services)
 * 
 * System-aware: Accepts systemId prop to show system-specific health
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Database,
  Server,
  Globe,
  Monitor,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Package,
  Link as LinkIcon,
} from 'lucide-react'
import {
  SystemComponent,
  ComponentType,
  HealthStatus,
  systemHealthManager,
} from '../lib/systemHealth'
import QuickHealthFix from './QuickHealthFix'

export type SystemId = 'money' | 'energy' | 'travel' | 'dashboard' | 'health'

interface SystemHealthObservabilityProps {
  systemId: SystemId
  compact?: boolean
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

type NavigationTab = 'observability' | 'components' | 'dependencies'

export default function SystemHealthObservability({
  systemId,
  compact = false,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000,
}: SystemHealthObservabilityProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<NavigationTab>('observability')
  const [components, setComponents] = useState<SystemComponent[]>([])
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  useEffect(() => {
    updateComponents()

    if (autoRefresh) {
      const interval = setInterval(() => {
        updateComponents()
        setLastUpdate(Date.now())
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, systemId])

  const updateComponents = () => {
    // Get system-specific components
    const allComponents = systemHealthManager.getAllComponents()
    const systemComponents = allComponents.filter((comp) => {
      // Filter by systemId if component has metadata
      if (comp.metadata?.systemId) {
        return comp.metadata.systemId === systemId
      }
      // Default: show all components for now (will be enhanced in 2.4)
      return true
    })
    setComponents(systemComponents)
  }

  const health = systemHealthManager.getOverallHealth()

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'checking':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'degraded':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'unhealthy':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'checking':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: ComponentType) => {
    switch (type) {
      case 'api-provider':
        return <Globe className="w-4 h-4" />
      case 'database':
        return <Database className="w-4 h-4" />
      case 'backend':
        return <Server className="w-4 h-4" />
      case 'ui':
        return <Monitor className="w-4 h-4" />
      case 'service':
        return <Zap className="w-4 h-4" />
      default:
        return <Server className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: ComponentType) => {
    switch (type) {
      case 'api-provider':
        return 'API Provider'
      case 'database':
        return 'Database'
      case 'backend':
        return 'Backend'
      case 'ui':
        return 'UI'
      case 'service':
        return 'Service'
      default:
        return type
    }
  }

  const handleRefresh = () => {
    updateComponents()
    setLastUpdate(Date.now())
  }

  const handleNavigateToDetail = (tab: NavigationTab) => {
    navigate(`/system-health/${systemId}/${tab}`)
  }

  // Collapsed view (summary)
  if (!isExpanded) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-sm">System Health</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(health.overall)}
                <span className={`text-xs ${getStatusColor(health.overall).split(' ')[0]}`}>
                  {health.healthy}/{health.total} components healthy
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Expand"
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Expanded view with navigation
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">System Health - {systemId.toUpperCase()}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatusColor(health.overall)}`}>
            {getStatusIcon(health.overall)}
            <span className="text-sm font-medium capitalize">{health.overall}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Collapse"
          >
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('observability')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'observability'
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Observability</span>
          </div>
          {activeTab === 'observability' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'components'
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Components</span>
          </div>
          {activeTab === 'components' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('dependencies')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'dependencies'
              ? 'text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            <span>Dependencies</span>
          </div>
          {activeTab === 'dependencies' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
      </div>

      {/* Quick Health Fix - Show in observability tab */}
      {activeTab === 'observability' && (
        <div className="mb-4">
          <QuickHealthFix systemId={systemId} />
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'observability' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Overall Health</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(health.byType)
                  .filter(([_, stats]) => stats.total > 0)
                  .map(([type, stats]) => (
                    <div
                      key={type}
                      className="bg-gray-700/50 rounded-lg p-3 border border-gray-600"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(type as ComponentType)}
                        <span className="text-xs font-medium text-gray-300">
                          {getTypeLabel(type as ComponentType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-400">{stats.healthy}</span>
                        <span className="text-xs text-gray-400">/</span>
                        <span className="text-sm text-gray-300">{stats.total}</span>
                        {stats.degraded > 0 && (
                          <span className="text-xs text-yellow-400 ml-1">({stats.degraded} degraded)</span>
                        )}
                        {stats.unhealthy > 0 && (
                          <span className="text-xs text-red-400 ml-1">({stats.unhealthy} down)</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleNavigateToDetail('observability')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View detailed observability
                <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Component Status</h4>
              {components.length > 0 ? (
                <div className="space-y-2">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getTypeIcon(component.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{component.name}</span>
                            {component.responseTime !== undefined && (
                              <span className="text-xs text-gray-400">
                                {component.responseTime}ms
                              </span>
                            )}
                          </div>
                          {component.endpoint && (
                            <span className="text-xs text-gray-500 truncate block">
                              {component.endpoint}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(component.status)}
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(component.status)}`}>
                          {component.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No components registered</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleNavigateToDetail('components')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View all components
                <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dependencies' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">External Dependencies</h4>
              {components.filter((c) => c.type === 'api-provider').length > 0 ? (
                <div className="space-y-2">
                  {components
                    .filter((c) => c.type === 'api-provider')
                    .map((component) => (
                      <div
                        key={component.id}
                        className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Globe className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">{component.name}</span>
                            {component.metadata?.apiKeyStatus && (
                              <span className="text-xs text-gray-500 block">
                                API Key: {component.metadata.apiKeyStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(component.status)}
                          <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(component.status)}`}>
                            {component.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No external dependencies registered</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleNavigateToDetail('dependencies')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View all dependencies
                <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {autoRefresh && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

