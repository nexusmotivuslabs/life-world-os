/**
 * SystemHealthDependenciesView
 * 
 * Detailed dependencies view showing:
 * - External API keys status
 * - Third-party services
 * - Integration health
 */

import { SystemId } from './SystemHealthObservability'
import {
  SystemComponent,
  HealthStatus,
  systemHealthManager,
} from '../lib/systemHealth'
import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Globe,
  Key,
  Link as LinkIcon,
} from 'lucide-react'

interface SystemHealthDependenciesViewProps {
  systemId: SystemId
}

export default function SystemHealthDependenciesView({
  systemId,
}: SystemHealthDependenciesViewProps) {
  const [dependencies, setDependencies] = useState<SystemComponent[]>([])

  useEffect(() => {
    const updateDependencies = () => {
      const allComponents = systemHealthManager.getAllComponents()
      const systemDependencies = allComponents.filter((comp) => {
        // Filter for API providers and external services
        if (comp.type === 'api-provider') {
          if (comp.metadata?.systemId) {
            return comp.metadata.systemId === systemId
          }
          return true
        }
        return false
      })
      setDependencies(systemDependencies)
    }

    updateDependencies()
    const interval = setInterval(updateDependencies, 30000)

    return () => clearInterval(interval)
  }, [systemId])

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
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

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">External Dependencies</h2>
        {dependencies.length > 0 ? (
          <div className="space-y-3">
            {dependencies.map((dependency) => (
              <div
                key={dependency.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="font-semibold">{dependency.name}</h3>
                      <p className="text-sm text-gray-400">External API Provider</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(dependency.status)}
                    <span className={`px-3 py-1 rounded-lg border text-sm ${getStatusColor(dependency.status)}`}>
                      {dependency.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {dependency.metadata?.apiKeyStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">API Key:</span>
                      <span
                        className={
                          dependency.metadata.apiKeyStatus === 'valid'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {dependency.metadata.apiKeyStatus}
                      </span>
                    </div>
                  )}
                  {dependency.endpoint && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <LinkIcon className="w-4 h-4" />
                      <span className="truncate">{dependency.endpoint}</span>
                    </div>
                  )}
                  {dependency.responseTime !== undefined && (
                    <div className="text-sm text-gray-400">
                      Response Time: {dependency.responseTime}ms
                    </div>
                  )}
                  {dependency.error && (
                    <div className="col-span-2 text-sm text-red-400">
                      <span className="text-gray-500">Error:</span> {dependency.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400">
            No external dependencies registered for this system
          </p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Dependency Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Dependencies</div>
            <div className="text-2xl font-bold text-blue-400">{dependencies.length}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Healthy</div>
            <div className="text-2xl font-bold text-green-400">
              {dependencies.filter((d) => d.status === 'healthy').length}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Issues</div>
            <div className="text-2xl font-bold text-red-400">
              {dependencies.filter((d) => d.status !== 'healthy').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


