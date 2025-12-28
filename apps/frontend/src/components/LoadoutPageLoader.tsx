/**
 * Loadout Page Loader
 * 
 * Wrapper component that loads loadout data before rendering the page.
 * This ensures data is available immediately when the page opens.
 * 
 * This follows the React principle: Load data before rendering the page.
 */

import { Loadout, LoadoutItem } from '../types/loadout'
import { loadoutApi } from '../services/loadoutApi'
import LoadoutPage from '../pages/LoadoutPage'
import { usePageDataLoader } from '../hooks/usePageDataLoader'

interface LoadoutPageData {
  loadouts: Loadout[]
  availableItems: LoadoutItem[]
}

export default function LoadoutPageLoader() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading loadouts...</div>
          <div className="text-gray-400 text-sm">Preparing your loadout data</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">Error loading loadouts</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
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

