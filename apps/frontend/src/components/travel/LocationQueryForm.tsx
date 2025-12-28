/**
 * LocationQueryForm Component
 * 
 * Form for querying locations based on descriptions.
 */

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'

export interface LocationQueryFormProps {
  onSubmit: (description: string, location?: string) => void
  loading?: boolean
}

export default function LocationQueryForm({ onSubmit, loading }: LocationQueryFormProps) {
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim()) {
      onSubmit(description.trim(), location.trim() || undefined)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">Find Similar Locations</h2>
      <p className="text-gray-400 mb-6">
        Describe a location and we'll find similar alternatives for you
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Location Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Not very big, quite beautiful...improvised from shipping containers, painted in cheerful colors. A few stands that sell fast food..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            City or Country (optional)
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., London, UK"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Searching...' : 'Find Similar Locations'}
        </button>
      </div>
    </form>
  )
}


