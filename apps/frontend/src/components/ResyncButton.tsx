/**
 * ResyncButton Component
 * 
 * Provides a button to manually trigger data resync.
 * Useful when data appears to be missing or stale.
 */

import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { performResync } from '../lib/resync'

interface ResyncButtonProps {
  variant?: 'button' | 'icon' | 'link'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  onComplete?: () => void
  className?: string
}

export default function ResyncButton({
  variant = 'button',
  size = 'md',
  showLabel = true,
  onComplete,
  className = '',
}: ResyncButtonProps) {
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const handleResync = async () => {
    setSyncing(true)
    setStatus('idle')
    setMessage('')

    try {
      await performResync({
        onProgress: (progressMessage) => {
          setMessage(progressMessage)
        },
      })

      setStatus('success')
      setMessage('Data refreshed successfully')
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 2000)

      onComplete?.()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to resync data')
      console.error('Resync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleResync}
        disabled={syncing}
        className={`p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        title="Resync data"
      >
        <RefreshCw className={`${sizeClasses[size]} ${syncing ? 'animate-spin' : ''}`} />
      </button>
    )
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleResync}
        disabled={syncing}
        className={`text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${textSizeClasses[size]} ${className}`}
      >
        <RefreshCw className={`${sizeClasses[size]} ${syncing ? 'animate-spin' : ''}`} />
        {showLabel && (syncing ? 'Syncing...' : 'Resync')}
      </button>
    )
  }

  // Default button variant
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleResync}
        disabled={syncing}
        className={`
          inline-flex items-center gap-2 px-4 py-2 
          bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 
          rounded-lg font-medium transition-colors
          disabled:cursor-not-allowed
          ${className}
        `}
      >
        <RefreshCw className={`${sizeClasses[size]} ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : 'Resync Data'}
      </button>
      
      {message && (
        <div className={`flex items-center gap-2 ${textSizeClasses.sm} ${
          status === 'success' ? 'text-green-400' : 
          status === 'error' ? 'text-red-400' : 
          'text-gray-400'
        }`}>
          {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {status === 'error' && <AlertCircle className="w-4 h-4" />}
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}


