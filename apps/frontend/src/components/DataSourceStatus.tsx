/**
 * DataSourceStatus Component
 * 
 * Shows detailed data source status with individual source availability.
 * Replaces generic "Partial data available" with specific source information.
 */

import { CheckCircle2, XCircle, AlertTriangle, Loader2, Database } from 'lucide-react'
import { DataSource, DataSourceStatus as DataSourceStatusType, dataSourceStatusManager } from '../lib/dataSourceStatus'
import { useState, useEffect } from 'react'

interface DataSourceStatusProps {
  sources?: DataSource[]
  showDetails?: boolean
  compact?: boolean
}

export default function DataSourceStatus({
  sources,
  showDetails = true,
  compact = false,
}: DataSourceStatusProps) {
  const [allSources, setAllSources] = useState<DataSource[]>(sources || [])

  useEffect(() => {
    if (!sources) {
      // Get sources from global manager
      const managerSources = dataSourceStatusManager.getAllSources()
      setAllSources(managerSources)

      // Listen for updates
      const interval = setInterval(() => {
        setAllSources(dataSourceStatusManager.getAllSources())
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setAllSources(sources)
    }
  }, [sources])

  const summary = dataSourceStatusManager.getStatusSummary()

  // Don't render if no sources are registered yet
  if (summary.total === 0 && allSources.length === 0) {
    return null
  }

  const getStatusIcon = (status: DataSourceStatusType) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'unavailable':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      default:
        return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: DataSourceStatusType) => {
    switch (status) {
      case 'available':
        return 'text-green-400'
      case 'partial':
        return 'text-yellow-400'
      case 'unavailable':
      case 'error':
        return 'text-red-400'
      case 'loading':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getOverallStatusMessage = () => {
    switch (summary.overallStatus) {
      case 'all-available':
        return `All data sources accessible (${summary.available}/${summary.total})`
      case 'partial':
        return `Data accessible with some sources unavailable (${summary.available + summary.partial}/${summary.total})`
      case 'degraded':
        return `Data partially accessible (${summary.available + summary.partial}/${summary.total} sources available)`
      case 'unavailable':
        return 'Data sources unavailable'
      default:
        return 'Checking data sources...'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {getStatusIcon(summary.overallStatus === 'all-available' ? 'available' : 
                      summary.overallStatus === 'partial' ? 'partial' : 
                      summary.overallStatus === 'degraded' ? 'error' : 'unavailable')}
        <span className={getStatusColor(
          summary.overallStatus === 'all-available' ? 'available' : 
          summary.overallStatus === 'partial' ? 'partial' : 
          summary.overallStatus === 'degraded' ? 'error' : 'unavailable'
        )}>
          {getOverallStatusMessage()}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">Data Sources Status</h3>
        </div>
        <div className={`text-sm ${getStatusColor(
          summary.overallStatus === 'all-available' ? 'available' : 
          summary.overallStatus === 'partial' ? 'partial' : 
          summary.overallStatus === 'degraded' ? 'error' : 'unavailable'
        )}`}>
          {getOverallStatusMessage()}
        </div>
      </div>

      {showDetails && allSources.length > 0 && (
        <div className="space-y-2">
          {allSources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1">
                {getStatusIcon(source.status)}
                <span className="text-sm font-medium">{source.name}</span>
                {source.recordCount !== undefined && (
                  <span className="text-xs text-gray-400">
                    ({source.recordCount}
                    {source.expectedCount && `/${source.expectedCount}`} records)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${getStatusColor(source.status)}`}>
                  {source.status === 'available' && 'Available'}
                  {source.status === 'partial' && 'Partial'}
                  {source.status === 'unavailable' && 'Unavailable'}
                  {source.status === 'error' && 'Error'}
                  {source.status === 'loading' && 'Loading...'}
                </span>
                {source.error && (
                  <span className="text-xs text-red-400" title={source.error}>
                    ⚠️
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {allSources.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          No data sources registered
        </p>
      )}
    </div>
  )
}

