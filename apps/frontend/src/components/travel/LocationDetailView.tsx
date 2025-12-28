/**
 * LocationDetailView Component
 * 
 * Detailed view for a location.
 */

import { useState, useEffect } from 'react'
import { Location, travelApi } from '../../services/travelApi'
import { ArrowLeft, ExternalLink, Star, MapPin, Heart, Loader2 } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

export interface LocationDetailViewProps {
  locationId: string
  onBack?: () => void
}

export default function LocationDetailView({ locationId, onBack }: LocationDetailViewProps) {
  const { addToast } = useToastStore()
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    loadLocation()
  }, [locationId])

  const loadLocation = async () => {
    try {
      setLoading(true)
      const data = await travelApi.getLocation(locationId)
      setLocation(data.location)
      // Check if saved
      const savedData = await travelApi.getSavedLocations()
      const savedItem = savedData.locations.find(
        (item) => item.location?.id === locationId
      )
      if (savedItem) {
        setSaved(true)
        setIsFavorite(savedItem.savedLocation.isFavorite)
      }
    } catch (error) {
      console.error('Failed to load location:', error)
      addToast({
        type: 'error',
        title: 'Failed to Load',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await travelApi.saveLocation(locationId, undefined, isFavorite)
      setSaved(true)
      addToast({
        type: 'success',
        title: 'Location Saved',
        message: 'Location has been saved to your list',
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Save',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleToggleFavorite = async () => {
    try {
      await travelApi.saveLocation(locationId, undefined, !isFavorite)
      setIsFavorite(!isFavorite)
      setSaved(true)
      addToast({
        type: 'success',
        title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
        message: isFavorite
          ? 'Location removed from favorites'
          : 'Location added to favorites',
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Update',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-gray-400">Loading location details...</span>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
        <p className="text-gray-400">Location not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{location.name}</h1>
            {(location.city || location.country) && (
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">
                  {[location.city, location.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
          {location.rating && (
            <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <div>
                <div className="text-yellow-400 font-bold text-xl">
                  {location.rating.toFixed(1)}
                </div>
                {location.userRatingsTotal && (
                  <div className="text-gray-400 text-xs">
                    {location.userRatingsTotal.toLocaleString()} reviews
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {location.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-300 leading-relaxed">{location.description}</p>
          </div>
        )}

        {location.category && (
          <div className="mb-6">
            <span className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">
              {location.category}
            </span>
          </div>
        )}

        {location.tags && location.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {location.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-6 border-t border-gray-700">
          {location.officialUrl && (
            <a
              href={location.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Visit Official Website
            </a>
          )}
          <button
            onClick={handleToggleFavorite}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isFavorite
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
          {!saved && (
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Save Location
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


