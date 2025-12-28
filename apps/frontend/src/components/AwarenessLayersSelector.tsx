/**
 * Awareness Layers Selector
 * 
 * Xbox 360-style selectable grid for awareness layers.
 * Supports keyboard navigation (arrow keys, Enter) and visual selection highlighting.
 */

import { useEffect, useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom' // Reserved for future navigation feature
import { awarenessApi, AwarenessLayer, AwarenessLayerCategory } from '../services/awarenessApi'
import { BookOpen, Eye, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AwarenessLayersSelectorProps {
  onLayerSelect?: (layer: AwarenessLayer) => void
}

export default function AwarenessLayersSelector({ onLayerSelect }: AwarenessLayersSelectorProps) {
  const [layers, setLayers] = useState<AwarenessLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState(0)
  // const navigate = useNavigate() // Reserved for future navigation feature
  const gridRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Grid configuration - Xbox 360 style (3 columns)
  const COLUMNS = 3

  useEffect(() => {
    loadAwarenessLayers()
  }, [])

  const loadAwarenessLayers = async () => {
    try {
      setLoading(true)
      const response = await awarenessApi.getLayers()
      // Sort by orderIndex, with Bible first
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (layers.length === 0) return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = Math.min(prev + 1, layers.length - 1)
            scrollToItem(next)
            return next
          })
          break
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = Math.max(prev - 1, 0)
            scrollToItem(next)
            return next
          })
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = Math.min(prev + COLUMNS, layers.length - 1)
            scrollToItem(next)
            return next
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = Math.max(prev - COLUMNS, 0)
            scrollToItem(next)
            return next
          })
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleLayerClick(layers[focusedIndex])
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [layers, focusedIndex])

  const scrollToItem = (index: number) => {
    const item = itemRefs.current[index]
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }

  const handleLayerClick = (layer: AwarenessLayer) => {
    setSelectedIndex(layers.findIndex((l) => l.id === layer.id))
    if (onLayerSelect) {
      onLayerSelect(layer)
    }
    // Could navigate to a detail page or show modal
    // navigate(`/awareness/${layer.id}`)
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
          hover: 'hover:border-blue-400',
          selected: 'border-blue-400 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900'
        }
      case 'EXAMINE':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          hover: 'hover:border-yellow-400',
          selected: 'border-yellow-400 ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900'
        }
      case 'REFUTE':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          hover: 'hover:border-red-400',
          selected: 'border-red-400 ring-2 ring-red-400 ring-offset-2 ring-offset-gray-900'
        }
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          hover: 'hover:border-gray-400',
          selected: 'border-gray-400 ring-2 ring-gray-400 ring-offset-2 ring-offset-gray-900'
        }
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">Loading awareness layers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-red-500/50">
        <div className="text-center text-red-400">{error}</div>
      </div>
    )
  }

  if (layers.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">No awareness layers available</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Awareness Layers</h2>
        <p className="text-gray-400 text-sm">
          Navigate with arrow keys, press Enter to select. Bible is the primary root awareness layer.
        </p>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        <AnimatePresence>
          {layers.map((layer, index) => {
            const Icon = getCategoryIcon(layer.category)
            const colors = getCategoryColor(layer.category)
            const isFocused = focusedIndex === index
            const isSelected = selectedIndex === index

            return (
              <motion.div
                key={layer.id}
                ref={(el) => (itemRefs.current[index] = el)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: isFocused ? 1.05 : 1,
                  y: isFocused ? -4 : 0
                }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setFocusedIndex(index)
                  handleLayerClick(layer)
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`
                  ${colors.bg} ${colors.border} ${colors.hover}
                  ${isFocused ? colors.selected : ''}
                  ${isSelected ? 'ring-4 ring-offset-4' : ''}
                  rounded-lg p-4 border-2 cursor-pointer transition-all
                  transform hover:scale-105
                `}
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
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {layer.description}
                  </p>
                )}

                {layer.parent && (
                  <div className="text-xs text-gray-400 mb-2">
                    Parent: {layer.parent.title}
                  </div>
                )}

                {layer.children && layer.children.length > 0 && (
                  <div className="text-xs text-gray-400 mb-2">
                    {layer.children.length} child{layer.children.length !== 1 ? 'ren' : ''}
                  </div>
                )}

                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600"
                  >
                    <span className="text-xs text-gray-400">Press Enter to select</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.div>
                )}

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 pt-3 border-t border-gray-600"
                  >
                    <div className="text-xs text-green-400 font-medium">Selected</div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Navigation hint */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Use arrow keys to navigate</span>
          <span>Enter to select</span>
        </div>
      </div>
    </div>
  )
}

