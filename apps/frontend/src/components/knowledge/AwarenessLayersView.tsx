/**
 * Awareness Layers View Component
 * 
 * Read-only display of awareness layers (worldview lenses, meaning frameworks).
 * Part of the Knowledge Plane - no mutations allowed.
 */

import { useEffect, useState } from 'react'
import { Eye, BookOpen, X } from 'lucide-react'
import { awarenessApi, AwarenessLayer, AwarenessLayerCategory } from '../../services/awarenessApi'

export default function AwarenessLayersView() {
  const [layers, setLayers] = useState<AwarenessLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<AwarenessLayer | null>(null)

  useEffect(() => {
    loadAwarenessLayers()
  }, [])

  const loadAwarenessLayers = async () => {
    try {
      setLoading(true)
      const response = await awarenessApi.getLayers()
      const sorted = response.layers.sort((a, b) => a.orderIndex - b.orderIndex)
      setLayers(sorted)
      setError(null)
    } catch (err) {
      setError('Failed to load awareness layers')
      console.error('Error loading awareness layers:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: AwarenessLayerCategory) => {
    switch (category) {
      case 'ROOT':
        return BookOpen
      case 'EXAMINE':
        return Eye
      case 'REFUTE':
        return X
      default:
        return BookOpen
    }
  }

  const getCategoryColor = (category: AwarenessLayerCategory) => {
    switch (category) {
      case 'ROOT':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-400',
        }
      case 'EXAMINE':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
        }
      case 'REFUTE':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
        }
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
        }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading awareness layers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Awareness Layers</h2>
        </div>
        <p className="text-gray-400">
          Worldview lenses, meaning frameworks, and meta-cognition tools. This is read-only information.
        </p>
      </div>

      {layers.length === 0 ? (
        <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 text-center">
          <p className="text-gray-400">No awareness layers available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layers.map((layer) => {
            const Icon = getCategoryIcon(layer.category)
            const colors = getCategoryColor(layer.category)

            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer)}
                className={`${colors.bg} ${colors.border} rounded-lg p-4 border-2 cursor-pointer transition-all hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {layer.isRoot && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                        ROOT
                      </span>
                    )}
                    <span className={`px-2 py-1 ${colors.bg} ${colors.text} text-xs rounded border ${colors.border}`}>
                      {layer.category}
                    </span>
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>
                  {layer.title}
                  {layer.orderIndex === 1 && (
                    <span className="ml-2 text-xs text-blue-400">#1</span>
                  )}
                </h3>

                {layer.description && (
                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">{layer.description}</p>
                )}

                {layer.parent && (
                  <div className="text-xs text-gray-400 mb-2">
                    Parent: {layer.parent.title}
                  </div>
                )}

                {layer.children && layer.children.length > 0 && (
                  <div className="text-xs text-gray-400">
                    {layer.children.length} child{layer.children.length !== 1 ? 'ren' : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Layer Detail Modal */}
      {selectedLayer && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedLayer(null)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedLayer.title}</h3>
              <button
                onClick={() => setSelectedLayer(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedLayer.description && (
              <p className="text-gray-300 mb-4">{selectedLayer.description}</p>
            )}

            {selectedLayer.content && (
              <div className="mb-4 p-4 bg-gray-700/50 rounded border border-gray-600">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedLayer.content}</p>
              </div>
            )}

            {selectedLayer.metadata && (
              <div className="mt-4 p-4 bg-gray-700/50 rounded border border-gray-600">
                <h4 className="font-semibold text-white mb-2">Metadata</h4>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(selectedLayer.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


