/**
 * ErrorRecovery Component
 * 
 * User-facing recovery options for failed data loads:
 * - Retry button
 * - Refresh page option
 * - Report issue link
 * - Fallback to demo mode (if applicable)
 */

import { AlertCircle, RefreshCw, RotateCcw, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { classifyError, getUserErrorMessage } from '../lib/errorClassification'

interface ErrorRecoveryProps {
  error: Error | null
  onRetry: () => void | Promise<void>
  showRefreshPage?: boolean
  showReportIssue?: boolean
  showDemoMode?: boolean
  onDemoMode?: () => void
}

export default function ErrorRecovery({
  error,
  onRetry,
  showRefreshPage = true,
  showReportIssue = true,
  showDemoMode = false,
  onDemoMode,
}: ErrorRecoveryProps) {
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  const handleRefreshPage = () => {
    window.location.reload()
  }

  const handleReportIssue = () => {
    const classified = error ? classifyError(error) : null
    const errorMessage = classified?.technicalMessage || error?.message || 'Unknown error'
    const errorStack = error?.stack || ''
    const issueBody = encodeURIComponent(
      `Error: ${errorMessage}\n\nStack:\n${errorStack}\n\nTimestamp: ${new Date().toISOString()}`
    )
    window.open(`mailto:support@example.com?subject=Error Report&body=${issueBody}`, '_blank')
  }

  // Classify error to determine what to show
  const classified = error ? classifyError(error) : null
  const isUserError = classified?.isUserError || false
  const displayMessage = classified ? getUserErrorMessage(error!) : 'An unexpected error occurred'

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold mb-1">
            {isUserError ? 'Error' : 'Failed to load data'}
          </h3>
          {error && (
            <p className="text-sm text-red-400/70 mb-3">
              {isUserError 
                ? displayMessage 
                : 'An unexpected error occurred. Please try again or contact support if the problem persists.'}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
            {showRefreshPage && (
              <button
                onClick={handleRefreshPage}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Refresh Page
              </button>
            )}
            {showReportIssue && (
              <button
                onClick={handleReportIssue}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Report Issue
              </button>
            )}
            {showDemoMode && onDemoMode && (
              <button
                onClick={onDemoMode}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
              >
                Use Demo Mode
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

