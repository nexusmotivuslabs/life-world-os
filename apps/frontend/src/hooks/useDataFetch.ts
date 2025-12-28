/**
 * useDataFetch Hook
 * 
 * Unified data fetching hook with automatic retry, health checks, graceful degradation,
 * and caching. Standardizes data fetching across all systems.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { checkHealth, isBackendAvailable } from '../services/healthCheck'
import { getCachedData, setCachedData } from '../lib/cache'
import { classifyError, shouldShowErrorToUser } from '../lib/errorClassification'
import { onResync } from '../lib/resync'
import { dataSourceStatusManager, createDataSourceFromFetch } from '../lib/dataSourceStatus'

export interface UseDataFetchOptions<T> {
  retries?: number
  retryDelay?: number
  fallbackData?: T
  enableHealthCheck?: boolean
  cacheKey?: string
  cacheTTL?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  enabled?: boolean
  dataSourceId?: string
  dataSourceName?: string
  expectedCount?: number
}

export interface UseDataFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  retry: () => Promise<void>
  isPartial: boolean
  isRefreshing: boolean
}

const DEFAULT_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000 // 1 second
const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt)
}

/**
 * useDataFetch Hook
 * 
 * @param fetchFn - Function that returns a Promise with the data
 * @param options - Configuration options
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions<T> = {}
): UseDataFetchResult<T> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    fallbackData,
    enableHealthCheck = true,
    cacheKey,
    cacheTTL = DEFAULT_CACHE_TTL,
    onSuccess,
    onError,
    enabled = true,
    dataSourceId,
    dataSourceName,
    expectedCount,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [isPartial, setIsPartial] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef<number>(0)

  /**
   * Execute the fetch with retry logic
   */
  const executeFetch = useCallback(
    async (isRetry: boolean = false): Promise<void> => {
      // Skip if disabled
      if (!enabled) {
        setLoading(false)
        return
      }

      // Cancel previous request if still in flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      // Set loading state
      if (isRetry) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      setIsPartial(false)

      // Check health before making request (if enabled)
      if (enableHealthCheck) {
        try {
          const isAvailable = await isBackendAvailable()
          if (!isAvailable) {
            // Use cached data if available
            if (cacheKey) {
              const cached = getCachedData<T>(cacheKey)
              if (cached) {
                setData(cached.data)
                setLoading(false)
                setIsRefreshing(false)
                setIsPartial(true)
                return
              }
            }

            // Use fallback data if available
            if (fallbackData !== undefined) {
              setData(fallbackData)
              setLoading(false)
              setIsRefreshing(false)
              setIsPartial(true)
              return
            }

            throw new Error('Backend is unavailable')
          }
        } catch (healthError) {
          // Health check failed, but continue anyway
          console.warn('Health check failed, proceeding with request:', healthError)
        }
      }

      // Try to get cached data first (stale-while-revalidate pattern)
      if (cacheKey && !isRetry) {
        const cached = getCachedData<T>(cacheKey)
        if (cached) {
          setData(cached.data)
          setLoading(false)
          // Continue to fetch fresh data in background
        }
      }

      // Attempt fetch with retries
      let lastError: Error | null = null

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await fetchFn()

          // Success - update state
          setData(result)
          setError(null)
          setIsPartial(false)
          setLoading(false)
          setIsRefreshing(false)
          retryCountRef.current = 0

          // Register data source status
          if (dataSourceId && dataSourceName) {
            const dataArray = Array.isArray(result) ? result : 
                            (result && typeof result === 'object' && 'agents' in result) ? (result as any).agents :
                            (result && typeof result === 'object' && 'teams' in result) ? (result as any).teams :
                            (result && typeof result === 'object' && 'products' in result) ? (result as any).products :
                            null
            const source = createDataSourceFromFetch(
              dataSourceId,
              dataSourceName,
              dataArray,
              null,
              false,
              expectedCount
            )
            dataSourceStatusManager.registerSource(source)
          }

          // Cache the result
          if (cacheKey) {
            setCachedData(cacheKey, result, cacheTTL)
          }

          // Call success callback
          if (onSuccess) {
            onSuccess(result)
          }

          return
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err))

          // Don't retry if aborted
          if (abortControllerRef.current?.signal.aborted) {
            return
          }

          // If not the last attempt, wait and retry
          if (attempt < retries) {
            const delay = getRetryDelay(attempt, retryDelay)
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }
        }
      }

      // All retries failed
      // Classify error to determine if it should be shown to user
      const classified = lastError ? classifyError(lastError) : null
      
      // Register data source status with error
      if (dataSourceId && dataSourceName) {
        const fallbackDataArray = fallbackData && Array.isArray(fallbackData) ? fallbackData :
                                 (fallbackData && typeof fallbackData === 'object' && 'agents' in fallbackData) ? (fallbackData as any).agents :
                                 (fallbackData && typeof fallbackData === 'object' && 'teams' in fallbackData) ? (fallbackData as any).teams :
                                 (fallbackData && typeof fallbackData === 'object' && 'products' in fallbackData) ? (fallbackData as any).products :
                                 null
        const source = createDataSourceFromFetch(
          dataSourceId,
          dataSourceName,
          fallbackDataArray,
          lastError,
          false,
          expectedCount
        )
        dataSourceStatusManager.registerSource(source)
      }
      
      // Only set error if it's a user error (app errors should be hidden)
      // App errors will be logged but not shown to users
      if (classified && classified.shouldShowToUser) {
        setError(lastError)
      } else if (lastError) {
        // Log app errors but don't show to user
        console.error('App error (hidden from user):', lastError)
        // Clear error state so UI doesn't show error
        setError(null)
      }
      
      setLoading(false)
      setIsRefreshing(false)
      retryCountRef.current++

      // Try to use cached data as fallback
      if (cacheKey) {
        const cached = getCachedData<T>(cacheKey)
        if (cached) {
          setData(cached.data)
          setIsPartial(true)
        }
      }

      // Use fallback data if available
      if (fallbackData !== undefined && !data) {
        setData(fallbackData)
        setIsPartial(true)
      }

      // Call error callback only for user errors (app errors are handled silently)
      if (onError && lastError && classified && classified.shouldShowToUser) {
        onError(lastError)
      }
    },
    [
      enabled,
      enableHealthCheck,
      fetchFn,
      retries,
      retryDelay,
      fallbackData,
      cacheKey,
      cacheTTL,
      onSuccess,
      onError,
      data,
      dataSourceId,
      dataSourceName,
      expectedCount,
    ]
  )

  /**
   * Manual retry function
   */
  const retry = useCallback(async () => {
    retryCountRef.current = 0
    await executeFetch(true)
  }, [executeFetch])

  // Initial fetch
  useEffect(() => {
    executeFetch(false)
  }, []) // Only run on mount

  // Listen for resync events
  useEffect(() => {
    const cleanup = onResync(() => {
      // Force refresh when resync is triggered
      executeFetch(true)
    })

    return cleanup
  }, [executeFetch])

  return {
    data,
    loading,
    error,
    retry,
    isPartial,
    isRefreshing,
  }
}

