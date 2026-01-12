/**
 * usePageDataLoader Hook
 * 
 * Reusable React hook for loading page data before rendering.
 * This ensures data is available immediately when the page opens.
 * 
 * Usage:
 * ```tsx
 * const { data, loading, error, retry } = usePageDataLoader(() => 
 *   Promise.all([api.getData1(), api.getData2()])
 * )
 * 
 * if (loading) return <LoadingSpinner />
 * if (error) return <ErrorDisplay error={error} onRetry={retry} />
 * if (!data) return null
 * 
 * return <PageComponent initialData={data} />
 * ```
 */

import { useState, useEffect, useCallback } from 'react'

interface UsePageDataLoaderOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function usePageDataLoader<T>(
  loadFn: () => Promise<T>,
  options: UsePageDataLoaderOptions<T> = {}
): {
  data: T | null
  loading: boolean
  error: string | null
  retry: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await loadFn()
      setData(result)
      options.onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      options.onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [loadFn, options])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    retry: loadData,
  }
}





