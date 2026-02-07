/**
 * MasterTravel Page
 *
 * Main interface for the Master Travel System featuring:
 * - Location query interface
 * - Alternative location recommendations
 * - Saved locations management
 */

import { useState } from 'react'
import { MapPin, Search, Bookmark } from 'lucide-react'
import { travelApi, Location } from '../services/travelApi'
import { useToastStore } from '../store/useToastStore'
import LocationQueryForm from '../components/travel/LocationQueryForm'
import LocationResults from '../components/travel/LocationResults'
import SavedLocationsView from '../components/travel/SavedLocationsView'
import LocationDetailView from '../components/travel/LocationDetailView'
import MasterSystemLayout from '../components/MasterSystemLayout'
import { useSystemData } from '../hooks/useSystemData'
import { MasterDomain } from '../types'

export default function MasterTravel() {
  const { addToast } = useToastStore()
  const [subView, setSubView] = useState<'find' | 'saved'>('find')
  const [locations, setLocations] = useState<Location[]>([])
  const [hierarchy, setHierarchy] = useState<
    Array<{ category: string; count: number; locations: Location[] }>
  >([])
  const [summary, setSummary] = useState<{
    total: number
    categories: string[]
    withWebsites: number
    averageRating: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

  const { teams, agents } = useSystemData({
    cacheKeyPrefix: 'master-travel',
    systemId: MasterDomain.TRAVEL,
    fetchProducts: false,
  })

  const handleQuery = async (description: string, location?: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await travelApi.queryLocations(description, location)

      if (!result?.locations?.length) {
        setError('No locations found. Try adjusting your search description.')
        addToast({
          type: 'warning',
          title: 'No Results',
          message: 'No locations found. Try a different description or location.',
        })
        setLocations([])
      } else {
        setLocations(result.locations)
        setHierarchy(result.hierarchy || [])
        setSummary(result.summary || null)
        addToast({
          type: 'success',
          title: 'Locations Found',
          message: `Found ${result.summary?.total ?? 0} location(s)`,
        })
      }
      setSubView('find')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to query locations'
      setError(errorMessage)
      addToast({ type: 'error', title: 'Query Failed', message: errorMessage })
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (locationId: string) => {
    try {
      await travelApi.saveLocation(locationId)
      addToast({
        type: 'success',
        title: 'Location Saved',
        message: 'Location has been saved to your list',
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Save',
        message: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }

  const handleViewDetails = (locationId: string) => {
    setSelectedLocationId(locationId)
  }

  if (selectedLocationId) {
    return (
      <LocationDetailView
        locationId={selectedLocationId}
        onBack={() => setSelectedLocationId(null)}
      />
    )
  }

  return (
    <MasterSystemLayout
      title="Master Travel System"
      description="Find location alternatives and travel recommendations"
      mantra="Location is optionality."
      icon={MapPin}
      color="text-cyan-400"
      bgColor="bg-cyan-600/20"
      teams={teams}
      agents={agents}
      loading={false}
      rootNodeId="systems-node-expression_tier-travel-universal-concept"
      renderOverview={() => (
        <div className="space-y-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSubView('find')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                subView === 'find'
                  ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <Search className="w-5 h-5" />
              Find Locations
            </button>
            <button
              onClick={() => setSubView('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                subView === 'saved'
                  ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              Saved Locations
            </button>
          </div>

          {subView === 'find' && (
            <>
              <LocationQueryForm onSubmit={handleQuery} loading={loading} />
              {locations.length > 0 && (
                <LocationResults
                  locations={locations}
                  hierarchy={hierarchy}
                  summary={summary}
                  loading={loading}
                  error={error}
                  onSave={handleSave}
                  onViewDetails={handleViewDetails}
                />
              )}
            </>
          )}

          {subView === 'saved' && <SavedLocationsView />}
        </div>
      )}
    />
  )
}
