/**
 * Health Diagnostics Component
 * 
 * Provides diagnostic information and actionable steps to fix unhealthy systems.
 */

import { AlertCircle, CheckCircle2, XCircle, RefreshCw, ExternalLink, Database, Server, Globe, BookOpen } from 'lucide-react'
import { SystemComponent, systemHealthManager, SystemId } from '../lib/systemHealth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { performResync } from '../lib/resync'
import { getSystemHealthRoute } from '../config/routes'

interface HealthDiagnosticsProps {
  systemId?: SystemId
  onFix?: () => void
}

export default function HealthDiagnostics({ systemId, onFix }: HealthDiagnosticsProps = {}) {
  const navigate = useNavigate()
  const [fixing, setFixing] = useState<string | null>(null)
  const allComponents = systemHealthManager.getAllComponents()
  const components = systemId
    ? systemHealthManager.getComponentsBySystem(systemId)
    : allComponents
  const unhealthyComponents = components.filter(c => c.status !== 'healthy')
  
  // Group issues by system type
  const apiKeyIssues = unhealthyComponents.filter(
    c => c.type === 'api-provider' && c.metadata?.apiKeyStatus !== 'valid'
  )
  const databaseIssues = unhealthyComponents.filter(c => c.type === 'database')
  const backendIssues = unhealthyComponents.filter(c => c.type === 'backend')
  const uiIssues = unhealthyComponents.filter(c => c.type === 'ui')

  const getDiagnostics = (component: SystemComponent): {
    issue: string
    steps: string[]
    canAutoFix: boolean
    systemType: 'api-key' | 'database' | 'backend' | 'ui' | 'other'
  } => {
    switch (component.type) {
      case 'backend':
        return {
          issue: 'Service is not responding',
          steps: [
            'Check your network connection',
            'Try again in a moment',
            ...(component.metadata?.bestPractices || []),
          ],
          canAutoFix: false,
          systemType: 'backend',
        }
      case 'database':
        return {
          issue: 'Data is temporarily unavailable',
          steps: [
            'Try again in a moment',
            'Check your connection',
            ...(component.metadata?.bestPractices || []),
          ],
          canAutoFix: false,
          systemType: 'database',
        }
      case 'api-provider':
        return {
          issue: component.error || 'API provider is not configured',
          steps: [
            'Check if API key is set in environment variables',
            'Verify API key is valid and has required permissions',
            'Check API provider status page',
            'Review API usage limits',
            ...(component.metadata?.bestPractices || []),
          ],
          canAutoFix: false,
          systemType: 'api-key',
        }
      case 'ui':
        return {
          issue: 'UI component issue',
          steps: [
            'Clear browser cache',
            'Refresh the page',
            'Check browser console for errors',
            'Try a different browser',
            ...(component.metadata?.bestPractices || []),
          ],
          canAutoFix: true,
          systemType: 'ui',
        }
      default:
        return {
          issue: component.error || 'Component is unhealthy',
          steps: [
            'Check component logs',
            'Verify component configuration',
            'Restart the component if possible',
            ...(component.metadata?.bestPractices || []),
          ],
          canAutoFix: false,
          systemType: 'other',
        }
    }
  }

  const handleFix = async (componentId: string) => {
    setFixing(componentId)
    try {
      // Perform resync which may help
      await performResync()
      
      // Trigger re-check of the component
      const component = systemHealthManager.getComponentStatus(componentId)
      if (component) {
        // Re-check will happen automatically via auto-check
        // Just wait a moment
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      onFix?.()
    } catch (error) {
      console.error('Fix failed:', error)
    } finally {
      setFixing(null)
    }
  }

  if (unhealthyComponents.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">All systems are healthy!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-400" />
        <h3 className="font-semibold">
          System Health Issues{systemId ? ` - ${systemId.toUpperCase()}` : ''}
        </h3>
        <span className="text-sm text-gray-400">
          ({unhealthyComponents.length} component{unhealthyComponents.length !== 1 ? 's' : ''} need attention)
        </span>
      </div>

      {/* Issue Summary by Type */}
      {(apiKeyIssues.length > 0 || databaseIssues.length > 0 || backendIssues.length > 0 || uiIssues.length > 0) && (
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Issues by type:</p>
          <div className="flex gap-3 text-xs">
            {apiKeyIssues.length > 0 && (
              <span className="text-yellow-400">
                {apiKeyIssues.length} API key issue{apiKeyIssues.length !== 1 ? 's' : ''}
              </span>
            )}
            {databaseIssues.length > 0 && (
              <span className="text-red-400">
                {databaseIssues.length} database issue{databaseIssues.length !== 1 ? 's' : ''}
              </span>
            )}
            {backendIssues.length > 0 && (
              <span className="text-red-400">
                {backendIssues.length} service issue{backendIssues.length !== 1 ? 's' : ''}
              </span>
            )}
            {uiIssues.length > 0 && (
              <span className="text-orange-400">
                {uiIssues.length} UI issue{uiIssues.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {unhealthyComponents.map((component) => {
          const diagnostics = getDiagnostics(component)
          return (
            <div
              key={component.id}
              className="bg-gray-700/50 rounded-lg p-4 border border-red-500/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {component.type === 'backend' && <Server className="w-4 h-4 text-red-400" />}
                  {component.type === 'database' && <Database className="w-4 h-4 text-red-400" />}
                  {component.type === 'api-provider' && <Globe className="w-4 h-4 text-red-400" />}
                  <div>
                    <h4 className="font-semibold text-red-400">{component.name}</h4>
                    <p className="text-sm text-gray-400">{diagnostics.issue}</p>
                  </div>
                </div>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>

              {component.error && (
                <div className="mb-3 p-2 bg-red-500/10 rounded text-xs text-red-300">
                  Error: {component.error}
                </div>
              )}

              {/* Expected Errors */}
              {component.metadata?.expectedErrors && component.metadata.expectedErrors.length > 0 && (
                <div className="mb-3 p-2 bg-yellow-500/10 rounded text-xs">
                  <p className="text-yellow-400 font-medium mb-1">Expected errors for this system:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-yellow-300">
                    {component.metadata.expectedErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-300 mb-2">Steps to fix:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400">
                  {diagnostics.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Runbook Link */}
              {component.metadata?.runbookUrl && (
                <div className="mb-3">
                  <button
                    onClick={() => {
                      if (systemId) {
                        navigate(getSystemHealthRoute(systemId, 'dependencies'))
                      } else if (component.metadata?.runbookUrl) {
                        navigate(component.metadata.runbookUrl)
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <BookOpen className="w-4 h-4" />
                    View runbook for {component.name}
                  </button>
                </div>
              )}

              {component.endpoint && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Endpoint:</p>
                  <code className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-300">
                    {component.endpoint}
                  </code>
                </div>
              )}

              <div className="flex gap-2">
                {diagnostics.canAutoFix && (
                  <button
                    onClick={() => handleFix(component.id)}
                    disabled={fixing === component.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded text-sm font-medium transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${fixing === component.id ? 'animate-spin' : ''}`} />
                    {fixing === component.id ? 'Fixing...' : 'Try Auto-Fix'}
                  </button>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

