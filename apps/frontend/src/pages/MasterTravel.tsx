/**
 * MasterTravel Page
 * 
 * Main interface for the Master Travel System featuring:
 * - Location query interface
 * - Alternative location recommendations
 * - Saved locations management
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Search, Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { travelApi, Location } from '../services/travelApi'
import { useToastStore } from '../store/useToastStore'
import LocationQueryForm from '../components/travel/LocationQueryForm'
import LocationResults from '../components/travel/LocationResults'
import SavedLocationsView from '../components/travel/SavedLocationsView'
import LocationDetailView from '../components/travel/LocationDetailView'

export default function MasterTravel() {
  const { addToast } = useToastStore()
  const [view, setView] = useState<'query' | 'saved' | 'details'>('query')
  const [locations, setLocations] = useState<Location[]>([])
  const [hierarchy, setHierarchy] = useState<Array<{
    category: string
    count: number
    locations: Location[]
  }>>([])
  const [summary, setSummary] = useState<{
    total: number
    categories: string[]
    withWebsites: number
    averageRating: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

  const handleQuery = async (description: string, location?: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await travelApi.queryLocations(description, location)
      
      if (!result || !result.locations || result.locations.length === 0) {
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
          message: `Found ${result.summary.total} location(s) in ${result.summary.categories.length} category/categories`,
        })
      }
      setView('query')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to query locations'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Query Failed',
        message: errorMessage,
      })
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
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Save',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleViewDetails = (locationId: string) => {
    setSelectedLocationId(locationId)
    setView('details')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/systems"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Systems
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Master Travel System</h1>
            <p className="text-gray-400 mt-1">
              Find location alternatives and travel recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => {
            setView('query')
            setSelectedLocationId(null)
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'query'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Find Locations
        </button>
        <button
          onClick={() => {
            setView('saved')
            setSelectedLocationId(null)
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'saved'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 inline mr-2" />
          Saved Locations
        </button>
      </div>

      {/* Query View */}
      {view === 'query' && (
        <div className="space-y-8">
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
        </div>
      )}

      {/* Saved Locations View */}
      {view === 'saved' && <SavedLocationsView />}

      {/* Details View */}
      {view === 'details' && selectedLocationId && (
        <LocationDetailView
          locationId={selectedLocationId}
          onBack={() => {
            setView('query')
            setSelectedLocationId(null)
          }}
        />
      )}
    </div>
  )
}

