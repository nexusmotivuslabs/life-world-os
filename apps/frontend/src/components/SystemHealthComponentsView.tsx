/**
 * SystemHealthComponentsView
 * 
 * Detailed components view showing:
 * - Individual component status
 * - Response times
 * - Component details and metadata
 */

import { SystemId } from './SystemHealthObservability'
import {
  SystemComponent,
  ComponentType,
  HealthStatus,
  systemHealthManager,
} from '../lib/systemHealth'
import { useState, useEffect } from 'react'
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
  Clock,
} from 'lucide-react'

interface SystemHealthComponentsViewProps {
  systemId: SystemId
}

export default function SystemHealthComponentsView({
  systemId,
}: SystemHealthComponentsViewProps) {
  const [components, setComponents] = useState<SystemComponent[]>([])

  useEffect(() => {
    const updateComponents = () => {
      const allComponents = systemHealthManager.getAllComponents()
      const systemComponents = allComponents.filter((comp) => {
        if (comp.metadata?.systemId) {
          return comp.metadata.systemId === systemId
        }
        return true
      })
      setComponents(systemComponents)
    }

    updateComponents()
    const interval = setInterval(updateComponents, 30000)

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

  const getTypeIcon = (type: ComponentType) => {
    switch (type) {
      case 'api-provider':
        return <Globe className="w-5 h-5" />
      case 'database':
        return <Database className="w-5 h-5" />
      case 'backend':
        return <Server className="w-5 h-5" />
      case 'ui':
        return <Monitor className="w-5 h-5" />
      case 'service':
        return <Zap className="w-5 h-5" />
      default:
        return <Server className="w-5 h-5" />
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

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Component Status</h2>
        {components.length > 0 ? (
          <div className="space-y-3">
            {components.map((component) => (
              <div
                key={component.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(component.type)}
                    <div>
                      <h3 className="font-semibold">{component.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">
                        {getTypeLabel(component.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(component.status)}
                    <span className={`px-3 py-1 rounded-lg border text-sm ${getStatusColor(component.status)}`}>
                      {component.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {component.responseTime !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Response Time: {component.responseTime}ms</span>
                    </div>
                  )}
                  {component.endpoint && (
                    <div className="text-sm text-gray-400 truncate">
                      <span className="text-gray-500">Endpoint:</span> {component.endpoint}
                    </div>
                  )}
                  {component.error && (
                    <div className="col-span-2 text-sm text-red-400">
                      <span className="text-gray-500">Error:</span> {component.error}
                    </div>
                  )}
                  {component.metadata && Object.keys(component.metadata).length > 0 && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">Metadata:</span>
                      <pre className="text-xs text-gray-400 mt-1 bg-gray-800 p-2 rounded">
                        {JSON.stringify(component.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400">No components registered for this system</p>
        )}
      </div>
    </div>
  )
}


