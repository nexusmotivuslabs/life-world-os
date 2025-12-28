/**
 * System Health Dashboard
 * 
 * Small dashboard showing live availability of:
 * - API providers (external integrations)
 * - Internal components (Database, Backend, UI)
 */

import { CheckCircle2, XCircle, AlertTriangle, Loader2, Database, Server, Globe, Monitor, Zap } from 'lucide-react'
import { SystemComponent, ComponentType, HealthStatus, systemHealthManager } from '../lib/systemHealth'
import { useState, useEffect } from 'react'

interface SystemHealthDashboardProps {
  compact?: boolean
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function SystemHealthDashboard({
  compact = false,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: SystemHealthDashboardProps) {
  const [components, setComponents] = useState<SystemComponent[]>([])
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  useEffect(() => {
    // Initial load
    updateComponents()

    // Auto-refresh
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateComponents()
        setLastUpdate(Date.now())
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const updateComponents = () => {
    setComponents(systemHealthManager.getAllComponents())
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

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {getStatusIcon(health.overall)}
        <span className={getStatusColor(health.overall).split(' ')[0]}>
          {health.healthy}/{health.total} components healthy
        </span>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">System Health</h3>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatusColor(health.overall)}`}>
          {getStatusIcon(health.overall)}
          <span className="text-sm font-medium capitalize">{health.overall}</span>
        </div>
      </div>

      {/* Summary by Type */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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

      {/* Component Details */}
      {showDetails && components.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Component Status</h4>
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
      )}

      {components.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          No components registered
        </p>
      )}

      {autoRefresh && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}


