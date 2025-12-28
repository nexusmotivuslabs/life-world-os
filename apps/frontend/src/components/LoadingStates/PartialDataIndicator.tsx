/**
 * PartialDataIndicator Component
 * 
 * Shows when some data is missing or unavailable.
 * Provides clear indication of partial data availability.
 */

import { AlertTriangle, Info } from 'lucide-react'

interface PartialDataIndicatorProps {
  message?: string
  availableCount?: number
  totalCount?: number
  variant?: 'warning' | 'info'
  onRefresh?: () => void
}

export default function PartialDataIndicator({
  message,
  availableCount,
  totalCount,
  variant = 'warning',
  onRefresh,
}: PartialDataIndicatorProps) {
  const isWarning = variant === 'warning'
  const bgColor = isWarning ? 'bg-yellow-500/10' : 'bg-blue-500/10'
  const borderColor = isWarning ? 'border-yellow-500/30' : 'border-blue-500/30'
  const textColor = isWarning ? 'text-yellow-400' : 'text-blue-400'
  const Icon = isWarning ? AlertTriangle : Info

  const displayMessage =
    message ||
    (availableCount !== undefined && totalCount !== undefined
      ? `Showing ${availableCount} of ${totalCount} items. Some data may be unavailable.`
      : 'Some data may be unavailable.')

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${textColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`text-sm ${textColor} font-medium`}>{displayMessage}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Try refreshing
          </button>
        )}
      </div>
    </div>
  )
}


