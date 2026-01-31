/**
 * Loadout Page Loader
 * 
 * Wrapper component that loads loadout data before rendering the page.
 * This ensures data is available immediately when the page opens.
 * 
 * This follows the React principle: Load data before rendering the page.
 */

import { useState, useEffect } from 'react'
import { Loadout, LoadoutItem } from '../types/loadout'
import { loadoutApi } from '../services/loadoutApi'
import LoadoutPage from '../pages/LoadoutPage'
import { usePageDataLoader } from '../hooks/usePageDataLoader'

interface LoadoutPageData {
  loadouts: Loadout[]
  availableItems: LoadoutItem[]
}

const SLOW_LOAD_THRESHOLD_MS = 6000

export default function LoadoutPageLoader() {
  const [showSlowHint, setShowSlowHint] = useState(false)

  const { data, loading, error, retry } = usePageDataLoader<LoadoutPageData>(
    async () => {
      // Load all required data in parallel
      const [loadoutsData, itemsData] = await Promise.all([
        loadoutApi.getLoadouts(),
        loadoutApi.getLoadoutItems(),
      ])

      return {
        loadouts: loadoutsData,
        availableItems: itemsData,
      }
    }
  )

  // If loading takes too long, show hint and retry option
  useEffect(() => {
    if (!loading) {
      setShowSlowHint(false)
      return
    }
    const t = setTimeout(() => setShowSlowHint(true), SLOW_LOAD_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-white text-xl mb-2">Loading loadouts...</div>
          <div className="text-gray-400 text-sm mb-2">Preparing your loadout data</div>
          <div className="text-gray-500 text-xs mb-4">
            Ensure the backend is running and loadout data is seeded.
          </div>
          {showSlowHint && (
            <button
              type="button"
              onClick={retry}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-400 text-xl mb-2">Error loading loadouts</div>
          <div className="text-gray-400 text-sm mb-2">{error}</div>
          <div className="text-gray-500 text-xs mb-4">
            Ensure the backend is running (e.g. port 5001) and loadout data is seeded.
          </div>
          <button
            onClick={retry}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Pass preloaded data to the page component
  return <LoadoutPage initialData={data} />
}

