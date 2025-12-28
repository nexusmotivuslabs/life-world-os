/**
 * useResync Hook
 * 
 * Provides resync functionality with automatic detection of missing data.
 */

import { useState, useEffect, useCallback } from 'react'
import { performResync, onResync, clearAllCaches } from '../lib/resync'

export interface UseResyncResult {
  isResyncing: boolean
  resync: () => Promise<void>
  clearCaches: () => void
  lastResyncTime: number | null
}

/**
 * Hook for resync functionality
 */
export function useResync(): UseResyncResult {
  const [isResyncing, setIsResyncing] = useState(false)
  const [lastResyncTime, setLastResyncTime] = useState<number | null>(null)

  const resync = useCallback(async () => {
    setIsResyncing(true)
    try {
      await performResync({
        onProgress: (message) => {
          console.log('Resync progress:', message)
        },
      })
      setLastResyncTime(Date.now())
    } catch (error) {
      console.error('Resync failed:', error)
      throw error
    } finally {
      setIsResyncing(false)
    }
  }, [])

  const clearCaches = useCallback(() => {
    clearAllCaches()
    setLastResyncTime(Date.now())
  }, [])

  // Listen for global resync events
  useEffect(() => {
    const cleanup = onResync(() => {
      setLastResyncTime(Date.now())
    })
    return cleanup
  }, [])

  return {
    isResyncing,
    resync,
    clearCaches,
    lastResyncTime,
  }
}


