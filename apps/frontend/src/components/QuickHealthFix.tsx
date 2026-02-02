/**
 * QuickHealthFix Component
 * 
 * Provides quick actions to fix common health issues.
 */

import { Zap, RefreshCw, CheckCircle2, Key, Database, Server, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { performResync } from '../lib/resync'
import { attemptRecovery, getHealthSummary } from '../lib/healthRecovery'
import { systemHealthManager, SystemId } from '../lib/systemHealth'

interface QuickHealthFixProps {
  systemId?: SystemId
}

export default function QuickHealthFix({ systemId }: QuickHealthFixProps = {}) {
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleQuickFix = async () => {
    setFixing(true)
    setResult(null)

    try {
      const API_BASE = import.meta.env.VITE_API_URL ?? ''
      const token = localStorage.getItem('token')

      // Call backend quick fix endpoint
      const response = await fetch(`${API_BASE}/api/health/quick-fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          systemId: systemId || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Quick fix request failed')
      }

      const data = await response.json()

      // Also perform frontend resync
      await performResync()

      // Refresh health checks
      const allComponents = systemHealthManager.getAllComponents()
      const components = systemId
        ? systemHealthManager.getComponentsBySystem(systemId)
        : allComponents
      const unhealthy = components.filter(c => c.status !== 'healthy')

      const recoveryResults = await Promise.allSettled(
        unhealthy.map(comp => attemptRecovery(comp.id))
      )

      const successful = recoveryResults.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length

      const summary = getHealthSummary()

      if (data.success && summary.allHealthy) {
        setResult({
          success: true,
          message: 'All systems are now healthy!',
        })
      } else if (data.success || successful > 0) {
        const fixedCount = data.results?.issuesFixed || successful
        setResult({
          success: true,
          message: `Fixed ${fixedCount} issue${fixedCount !== 1 ? 's' : ''}. ${data.results?.issuesRemaining || 0} issue${(data.results?.issuesRemaining || 0) !== 1 ? 's' : ''} may need manual attention.`,
        })
      } else {
        setResult({
          success: false,
          message: data.message || 'Could not automatically fix issues. Please check the diagnostics below for manual steps.',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Quick fix failed',
      })
    } finally {
      setFixing(false)
      // Clear result after 5 seconds
      setTimeout(() => setResult(null), 5000)
    }
  }

  const summary = getHealthSummary()
  const components = systemId
    ? systemHealthManager.getComponentsBySystem(systemId)
    : systemHealthManager.getAllComponents()
  
  // Categorize issues by system type
  const apiKeyIssues = components.filter(
    c => c.type === 'api-provider' && c.status !== 'healthy' && c.metadata?.apiKeyStatus !== 'valid'
  )
  const databaseIssues = components.filter(
    c => c.type === 'database' && c.status !== 'healthy'
  )
  const backendIssues = components.filter(
    c => c.type === 'backend' && c.status !== 'healthy'
  )
  const uiIssues = components.filter(
    c => c.type === 'ui' && c.status !== 'healthy'
  )

  const systemSpecificIssues = {
    apiKeys: apiKeyIssues.length,
    database: databaseIssues.length,
    backend: backendIssues.length,
    ui: uiIssues.length,
  }

  const totalIssues = Object.values(systemSpecificIssues).reduce((a, b) => a + b, 0)
  const criticalIssues = components.filter(c => c.status === 'unhealthy').length

  if (summary.allHealthy && totalIssues === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">
            {systemId ? `${systemId.toUpperCase()} system is healthy!` : 'All systems are healthy!'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-400 mb-1">
            Quick Health Fix{systemId ? ` - ${systemId.toUpperCase()}` : ''}
          </h3>
          <p className="text-sm text-gray-400">
            {criticalIssues > 0
              ? `${criticalIssues} critical issue${criticalIssues !== 1 ? 's' : ''} detected`
              : totalIssues > 0
              ? `${totalIssues} issue${totalIssues !== 1 ? 's' : ''} detected`
              : summary.warnings > 0 
              ? `${summary.warnings} warning${summary.warnings !== 1 ? 's' : ''} detected`
              : 'Issues detected'}
          </p>
          {totalIssues > 0 && (
            <div className="flex gap-2 mt-2 text-xs">
              {systemSpecificIssues.apiKeys > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Key className="w-3 h-3" />
                  {systemSpecificIssues.apiKeys} API key
                </span>
              )}
              {systemSpecificIssues.database > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <Database className="w-3 h-3" />
                  {systemSpecificIssues.database} database
                </span>
              )}
              {systemSpecificIssues.backend > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <Server className="w-3 h-3" />
                  {systemSpecificIssues.backend} backend
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleQuickFix}
          disabled={fixing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg font-medium transition-colors"
        >
          <Zap className={`w-4 h-4 ${fixing ? 'animate-pulse' : ''}`} />
          {fixing ? 'Fixing...' : 'Quick Fix'}
        </button>
      </div>

      {result && (
        <div className={`mt-3 p-3 rounded-lg ${
          result.success 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
        }`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">
        <p>Quick Fix will:</p>
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          <li>Clear all caches</li>
          <li>Refresh health checks</li>
          <li>Attempt automatic recovery</li>
        </ul>
      </div>
    </div>
  )
}

