/**
 * CustomLocationCard Component
 * 
 * Extends BaseLocationCard with travel-specific features.
 */

import BaseLocationCard, { BaseLocationCardProps } from './BaseLocationCard'
import { Location } from '../../services/travelApi'
import { Users, Clock } from 'lucide-react'

export interface CustomLocationCardProps extends BaseLocationCardProps {
  showRatings?: boolean
  showUserCount?: boolean
}

export default function CustomLocationCard({
  location,
  onSave,
  onViewDetails,
  showRatings = true,
  showUserCount = true,
}: CustomLocationCardProps) {
  // Override formatDescription to show more details
  const formatDescription = (description: string | null, maxLength: number = 200): string => {
    if (!description) return 'No description available'
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all relative">
      {/* Enhanced header with more info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{location.name}</h3>
          {(location.city || location.country) && (
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>
                {[location.city, location.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        {showRatings && location.rating && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
              <span className="text-yellow-400 text-sm font-medium">
                {location.rating.toFixed(1)}
              </span>
            </div>
            {showUserCount && location.userRatingsTotal && (
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Users className="w-3 h-3" />
                <span>{location.userRatingsTotal.toLocaleString()} reviews</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced description */}
      {location.description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {formatDescription(location.description)}
        </p>
      )}

      {/* Tags */}
      {location.tags && location.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {location.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex gap-4">
          {location.officialUrl && (
            <a
              href={location.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              <span>Visit Website</span>
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(location.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Explore location
            </button>
          )}
          {onSave && (
            <button
              onClick={() => onSave(location.id)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

