/**
 * LocationResults Component
 * 
 * Display query results with location alternatives in a hierarchical structure.
 */

import { Location } from '../../services/travelApi'
import CustomLocationCard from './CustomLocationCard'
import { Loader2, AlertCircle, Globe, MapPin } from 'lucide-react'

export interface LocationResultsProps {
  locations: Location[]
  hierarchy?: Array<{
    category: string
    count: number
    locations: Location[]
  }>
  summary?: {
    total: number
    categories: string[]
    withWebsites: number
    averageRating: number
  }
  loading?: boolean
  error?: string | null
  onSave?: (locationId: string) => void
  onViewDetails?: (locationId: string) => void
}

export default function LocationResults({
  locations,
  hierarchy,
  summary,
  loading,
  error,
  onSave,
  onViewDetails,
}: LocationResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-gray-400">Searching for locations...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
        <p className="text-gray-400">No locations found. Try adjusting your search criteria.</p>
      </div>
    )
  }

  // Use hierarchy if available, otherwise use flat list
  const displayHierarchy = hierarchy && hierarchy.length > 0
  const locationsWithoutWebsites = locations.filter(loc => !loc.officialUrl)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Found {summary.total} Location(s)</h2>
            {summary.averageRating > 0 && (
              <div className="text-sm text-gray-400">
                Avg Rating: {summary.averageRating.toFixed(1)} ⭐
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {summary.categories.length} {summary.categories.length === 1 ? 'Category' : 'Categories'}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {summary.withWebsites} with websites
            </span>
          </div>
        </div>
      )}

      {/* Warning for locations without websites */}
      {locationsWithoutWebsites.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm">
            ⚠️ {locationsWithoutWebsites.length} location(s) missing website URLs
          </p>
        </div>
      )}

      {/* Hierarchical Display */}
      {displayHierarchy ? (
        <div className="space-y-8">
          {hierarchy.map((categoryGroup) => (
            <div key={categoryGroup.category} className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <h3 className="text-xl font-semibold capitalize">
                  {categoryGroup.category.replace(/_/g, ' ')}
                </h3>
                <span className="text-sm text-gray-400">
                  {categoryGroup.count} {categoryGroup.count === 1 ? 'location' : 'locations'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryGroup.locations.map((location) => (
                  <CustomLocationCard
                    key={location.id}
                    location={location}
                    onSave={onSave}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Display */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <CustomLocationCard
              key={location.id}
              location={location}
              onSave={onSave}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  )
}

