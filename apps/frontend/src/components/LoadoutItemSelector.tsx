/**
 * Loadout Item Selector
 * 
 * Modal for selecting a loadout item for a specific slot
 */

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadoutItem, LoadoutSlotType, SLOT_TYPE_LABELS } from '../types/loadout'

interface LoadoutItemSelectorProps {
  slotType: LoadoutSlotType
  items: LoadoutItem[]
  onSelect: (itemId: string) => void
  onClose: () => void
  onViewItem: (item: LoadoutItem) => void
}

export default function LoadoutItemSelector({
  slotType,
  items,
  onSelect,
  onClose,
  onViewItem,
}: LoadoutItemSelectorProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold">
              Select {SLOT_TYPE_LABELS[slotType]}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No items available for this slot</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onSelect(item.id)}
                    className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                        PL: {item.powerLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(item.id)
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
                      >
                        Select
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewItem(item)
                        }}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                      >
                        Inspect item
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

