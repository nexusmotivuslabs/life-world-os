/**
 * SavedArtifactsView Component
 * 
 * Component for viewing and managing saved artifacts (recommendations, calculations, etc.)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  BookOpen,
  Calculator,
  FileText,
  Target,
  AlertCircle,
  Star,
  Trash2,
  Search,
  Filter,
  X,
  Eye,
} from 'lucide-react'
import { artifactApi, UserArtifact, ArtifactType } from '../services/artifactApi'
import { useToastStore } from '../store/useToastStore'
import { formatCurrencySimple } from '../utils/currency'

interface SavedArtifactsViewProps {
  userId?: string
  onClose?: () => void
}

const artifactTypeIcons: Record<ArtifactType, typeof BookOpen> = {
  RECOMMENDATION: Target,
  CALCULATION: Calculator,
  SCENARIO: FileText,
  REPORT: FileText,
  NOTE: BookOpen,
}

const artifactTypeColors: Record<ArtifactType, string> = {
  RECOMMENDATION: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  CALCULATION: 'text-green-400 bg-green-500/10 border-green-500/30',
  SCENARIO: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  REPORT: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  NOTE: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

export default function SavedArtifactsView({ userId, onClose }: SavedArtifactsViewProps) {
  const { addToast } = useToastStore()
  const [artifacts, setArtifacts] = useState<UserArtifact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ArtifactType | 'ALL'>('ALL')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<UserArtifact | null>(null)

  useEffect(() => {
    loadArtifacts()
  }, [userId, filterType, showFavoritesOnly])

  const loadArtifacts = async () => {
    try {
      setLoading(true)
      const result = await artifactApi.list(userId, {
        type: filterType !== 'ALL' ? filterType : undefined,
        favorites: showFavoritesOnly || undefined,
      })
      setArtifacts(result.artifacts)
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load artifacts'
      
      addToast({
        type: 'error',
        title: 'Failed to Load',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadArtifacts()
      return
    }

    try {
      setLoading(true)
      const result = await artifactApi.search(searchQuery, userId)
      setArtifacts(result.artifacts)
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to search artifacts'
      
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (artifact: UserArtifact) => {
    try {
      const result = await artifactApi.toggleFavorite(artifact.id)
      setArtifacts(prev =>
        prev.map(a => (a.id === artifact.id ? { ...a, isFavorite: result.artifact.isFavorite } : a))
      )
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update favorite status'
      
      addToast({
        type: 'error',
        title: 'Failed to Update',
        message: errorMessage,
      })
    }
  }

  const handleDelete = async (artifact: UserArtifact) => {
    if (!confirm(`Are you sure you want to delete "${artifact.title}"?`)) {
      return
    }

    try {
      await artifactApi.delete(artifact.id)
      setArtifacts(prev => prev.filter(a => a.id !== artifact.id))
      if (selectedArtifact?.id === artifact.id) {
        setSelectedArtifact(null)
      }
      addToast({
        type: 'success',
        title: 'Deleted',
        message: 'Artifact deleted successfully',
      })
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete artifact'
      
      addToast({
        type: 'error',
        title: 'Failed to Delete',
        message: errorMessage,
      })
    }
  }

  const filteredArtifacts = artifacts.filter(artifact => {
    if (showFavoritesOnly && !artifact.isFavorite) return false
    if (filterType !== 'ALL' && artifact.type !== filterType) return false
    return true
  })

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Save className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">My Saved Artifacts</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ArtifactType | 'ALL')}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="RECOMMENDATION">Recommendations</option>
              <option value="CALCULATION">Calculations</option>
              <option value="SCENARIO">Scenarios</option>
              <option value="REPORT">Reports</option>
              <option value="NOTE">Notes</option>
            </select>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Star className={`w-4 h-4 inline mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites Only
          </button>
        </div>
      </div>

      {/* Artifacts List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading artifacts...</div>
      ) : filteredArtifacts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Save className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No artifacts found</p>
          <p className="text-sm mt-2">
            {searchQuery || filterType !== 'ALL' || showFavoritesOnly
              ? 'Try adjusting your filters'
              : 'Save recommendations and calculations from products to see them here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredArtifacts.map((artifact) => {
              const Icon = artifactTypeIcons[artifact.type]
              return (
                <motion.div
                  key={artifact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-gray-700/50 rounded-lg p-4 border ${
                    artifactTypeColors[artifact.type].split(' ')[2]
                  } hover:border-opacity-60 transition-all cursor-pointer`}
                  onClick={() => setSelectedArtifact(artifact)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${artifactTypeColors[artifact.type].split(' ')[1]}`}>
                        <Icon className={`w-5 h-5 ${artifactTypeColors[artifact.type].split(' ')[0]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{artifact.title}</h3>
                          {artifact.isFavorite && (
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{artifact.productName}</p>
                        {artifact.description && (
                          <p className="text-sm text-gray-300 mb-2">{artifact.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{artifact.type}</span>
                          <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
                          {artifact.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {artifact.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-gray-600 rounded text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(artifact)
                        }}
                        className={`p-2 rounded-md transition-colors ${
                          artifact.isFavorite
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${artifact.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(artifact)
                        }}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <ArtifactDetailModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          onToggleFavorite={() => handleToggleFavorite(selectedArtifact)}
          onDelete={() => handleDelete(selectedArtifact)}
        />
      )}
    </div>
  )
}

function ArtifactDetailModal({
  artifact,
  onClose,
  onToggleFavorite,
  onDelete,
}: {
  artifact: UserArtifact
  onClose: () => void
  onToggleFavorite: () => void
  onDelete: () => void
}) {
  const Icon = artifactTypeIcons[artifact.type]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${artifactTypeColors[artifact.type].split(' ')[1]}`}>
              <Icon className={`w-6 h-6 ${artifactTypeColors[artifact.type].split(' ')[0]}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{artifact.title}</h2>
              <p className="text-sm text-gray-400">{artifact.productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {artifact.description && (
          <p className="text-gray-300 mb-4">{artifact.description}</p>
        )}

        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Data</h3>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            {JSON.stringify(artifact.data, null, 2)}
          </pre>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              artifact.isFavorite
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Star className={`w-4 h-4 inline mr-2 ${artifact.isFavorite ? 'fill-current' : ''}`} />
            {artifact.isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium text-white"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Delete
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}


