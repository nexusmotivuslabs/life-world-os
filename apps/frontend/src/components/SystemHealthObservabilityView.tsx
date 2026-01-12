/**
 * SystemHealthObservabilityView
 * 
 * Detailed observability view showing:
 * - Overall system health metrics
 * - Health trends over time
 * - System-wide statistics
 */

import { SystemId } from './SystemHealthObservability'
import { systemHealthManager } from '../lib/systemHealth'
import { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface SystemHealthObservabilityViewProps {
  systemId: SystemId
}

export default function SystemHealthObservabilityView({
  systemId,
}: SystemHealthObservabilityViewProps) {
  const [health, setHealth] = useState(systemHealthManager.getOverallHealth())

  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(systemHealthManager.getOverallHealth())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Overall System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Healthy</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{health.healthy}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Degraded</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{health.degraded}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-400">Unhealthy</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{health.unhealthy}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{health.total}</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Health by Component Type</h2>
        <div className="space-y-3">
          {Object.entries(health.byType)
            .filter(([_, stats]) => stats.total > 0)
            .map(([type, stats]) => (
              <div key={type} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{type.replace('-', ' ')}</span>
                  <span className="text-sm text-gray-400">
                    {stats.healthy}/{stats.total} healthy
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.healthy / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-lg border ${
              health.overall === 'healthy'
                ? 'text-green-400 bg-green-500/10 border-green-500/30'
                : health.overall === 'degraded'
                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                : 'text-red-400 bg-red-500/10 border-red-500/30'
            }`}
          >
            <span className="font-medium capitalize">{health.overall}</span>
          </div>
          <span className="text-sm text-gray-400">
            {systemId.toUpperCase()} system is {health.overall}
          </span>
        </div>
      </div>
    </div>
  )
}





