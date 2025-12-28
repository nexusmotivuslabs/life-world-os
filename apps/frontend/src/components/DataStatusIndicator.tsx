/**
 * DataStatusIndicator Component
 * 
 * Visual indicator showing data availability status:
 * - ✅ All data available
 * - ⚠️ Partial data (some unavailable)
 * - ❌ Data unavailable (with retry option)
 * - 🔄 Refreshing
 */

import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react'

interface DataStatusIndicatorProps {
  loading: boolean
  hasError: boolean
  isPartial: boolean
  dataAvailable: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function DataStatusIndicator({
  loading,
  hasError,
  isPartial,
  dataAvailable,
  size = 'md',
}: DataStatusIndicatorProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className={`${iconSize} animate-spin`} />
        <span className={textSize}>Loading...</span>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <XCircle className={iconSize} />
        <span className={textSize}>Unavailable</span>
      </div>
    )
  }

  if (isPartial) {
    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <AlertTriangle className={iconSize} />
        <span className={textSize}>Partial</span>
      </div>
    )
  }

  if (dataAvailable) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle2 className={iconSize} />
        <span className={textSize}>Available</span>
      </div>
    )
  }

  // No data available
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <XCircle className={iconSize} />
      <span className={textSize}>No data</span>
    </div>
  )
}


