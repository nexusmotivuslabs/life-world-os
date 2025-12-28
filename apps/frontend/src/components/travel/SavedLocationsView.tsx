/**
 * SavedLocationsView Component
 * 
 * Display user's saved locations.
 */

import { useState, useEffect } from 'react'
import { LocationWithSaved } from '../../services/travelApi'
import { travelApi } from '../../services/travelApi'
import CustomLocationCard from './CustomLocationCard'
import { Heart, Search, Loader2 } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

export default function SavedLocationsView() {
  const { addToast } = useToastStore()
  const [locations, setLocations] = useState<LocationWithSaved[]>([])
  const [loading, setLoading] = useState(true)
  const [showFavorites, setShowFavorites] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadSavedLocations()
  }, [showFavorites])

  const loadSavedLocations = async () => {
    try {
      setLoading(true)
      const data = await travelApi.getSavedLocations(showFavorites)
      setLocations(data.locations)
    } catch (error) {
      console.error('Failed to load saved locations:', error)
      addToast({
        type: 'error',
        title: 'Failed to Load',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredLocations = locations.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.location?.name.toLowerCase().includes(query) ||
      item.location?.description?.toLowerCase().includes(query) ||
      item.location?.city?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-gray-400">Loading saved locations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Locations</h2>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            showFavorites
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          <Heart className="w-4 h-4" />
          {showFavorites ? 'Show All' : 'Show Favorites'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved locations..."
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredLocations.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <p className="text-gray-400">
            {showFavorites
              ? 'No favorite locations yet. Save some locations and mark them as favorites!'
              : 'No saved locations yet. Start saving locations to see them here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((item) =>
            item.location ? (
              <CustomLocationCard
                key={item.savedLocation.id}
                location={item.location}
                onViewDetails={(id) => {
                  // Navigate to details
                  // TODO: Implement location detail route if needed
                  // For now, this could navigate to a detail view
                  console.log('View location details:', id)
                }}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}

