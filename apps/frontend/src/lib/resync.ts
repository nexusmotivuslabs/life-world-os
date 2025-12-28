/**
 * Resync Utility
 * 
 * Provides mechanisms to resync data across the application:
 * - Clear caches
 * - Force refresh of data
 * - Retry failed requests
 * - Check health status
 */

import { clearCache, cleanExpiredEntries } from './cache'
import { clearHealthCache, checkHealth } from '../services/healthCheck'

/**
 * Resync options
 */
export interface ResyncOptions {
  clearCache?: boolean
  clearHealthCache?: boolean
  forceHealthCheck?: boolean
  onProgress?: (message: string) => void
}

/**
 * Perform a full resync of the application
 */
export async function performResync(options: ResyncOptions = {}): Promise<void> {
  const {
    clearCache: shouldClearCache = true,
    clearHealthCache: shouldClearHealthCache = true,
    forceHealthCheck = true,
    onProgress,
  } = options

  try {
    // Step 1: Clear caches
    if (shouldClearCache) {
      onProgress?.('Clearing caches...')
      clearCache()
      cleanExpiredEntries()
    }

    // Step 2: Clear health check cache
    if (shouldClearHealthCache) {
      onProgress?.('Refreshing health status...')
      clearHealthCache()
    }

    // Step 3: Force health check
    if (forceHealthCheck) {
      onProgress?.('Checking backend health...')
      await checkHealth(true) // Force refresh
    }

    // Step 4: Trigger window event for components to refresh
    onProgress?.('Notifying components to refresh...')
    window.dispatchEvent(new CustomEvent('app:resync', { detail: { timestamp: Date.now() } }))

    onProgress?.('Resync complete!')
  } catch (error) {
    console.error('Resync error:', error)
    throw error
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  clearCache()
  clearHealthCache()
  cleanExpiredEntries()
}

/**
 * Force refresh current page data
 */
export function forceRefresh(): void {
  // Clear caches
  clearAllCaches()
  
  // Dispatch resync event
  window.dispatchEvent(new CustomEvent('app:resync', { detail: { timestamp: Date.now() } }))
  
  // Optionally reload the page
  // window.location.reload()
}

/**
 * Listen for resync events
 */
export function onResync(callback: (event: CustomEvent) => void): () => void {
  const handler = (event: Event) => {
    callback(event as CustomEvent)
  }
  
  window.addEventListener('app:resync', handler)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('app:resync', handler)
  }
}


