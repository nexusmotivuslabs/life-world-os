/**
 * useSystemHealth Hook
 * 
 * Hook to initialize and manage system health monitoring.
 */

import { useEffect } from 'react'
import { initializeSystemHealth } from '../services/systemHealthChecks'

/**
 * Initialize system health monitoring
 */
export function useSystemHealth(autoStart: boolean = true) {
  useEffect(() => {
    if (autoStart) {
      initializeSystemHealth()
    }

    // Cleanup on unmount
    return () => {
      // System health manager will continue running
      // Components can stop their own checks if needed
    }
  }, [autoStart])
}


