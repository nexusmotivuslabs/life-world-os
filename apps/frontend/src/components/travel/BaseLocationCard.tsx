/**
 * BaseLocationCard Component
 * 
 * Base component with common location card functionality.
 * Can be extended by CustomLocationCard for travel-specific features.
 */

import { Location } from '../../services/travelApi'
import { MapPin, ExternalLink, Star } from 'lucide-react'

export interface BaseLocationCardProps {
  location: Location
  onSave?: (locationId: string) => void
  onViewDetails?: (locationId: string) => void
}

export default function BaseLocationCard({
  location,
  onSave,
  onViewDetails,
}: BaseLocationCardProps) {
  const handleSave = () => {
    if (onSave) {
      onSave(location.id)
    }
  }

  const formatDescription = (description: string | null, maxLength: number = 150): string => {
    if (!description) return 'No description available'
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  const validateUrl = (url: string | null): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{location.name}</h3>
          {(location.city || location.country) && (
            <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>
                {[location.city, location.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        {location.rating && (
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">
              {location.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {location.description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {formatDescription(location.description)}
        </p>
      )}

      {location.category && (
        <div className="mb-4">
          <span className="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
            {location.category}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {validateUrl(location.officialUrl) && (
            <a
              href={location.officialUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(location.id)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Details
            </button>
          )}
          {onSave && (
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


