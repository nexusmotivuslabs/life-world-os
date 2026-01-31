/**
 * Loadout Page
 * 
 * Main page for managing loadouts - similar to COD/Halo loadout system
 */

import { useEffect, useState, useRef } from 'react'
import { Target, Plus, Trash2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { loadoutApi } from '../services/loadoutApi'
import {
  Loadout,
  LoadoutItem,
  LoadoutSlotType,
  SLOT_TYPE_LABELS,
  PowerLevelBreakdown,
} from '../types/loadout'
import LoadoutItemSelector from '../components/LoadoutItemSelector'
import LoadoutItemModal from '../components/LoadoutItemModal'
import PowerLevelDisplay from '../components/PowerLevelDisplay'
import { logger } from '../lib/logger'

interface LoadoutPageProps {
  initialData?: {
    loadouts: Loadout[]
    availableItems: LoadoutItem[]
  }
}

export default function LoadoutPage({ initialData }: LoadoutPageProps) {
  const [loadouts, setLoadouts] = useState<Loadout[]>(initialData?.loadouts || [])
  const [selectedLoadout, setSelectedLoadout] = useState<Loadout | null>(null)
  const [availableItems, setAvailableItems] = useState<LoadoutItem[]>(initialData?.availableItems || [])
  const [powerLevel, setPowerLevel] = useState<PowerLevelBreakdown | null>(null)
  const [loading, setLoading] = useState(!initialData)
  const [selectingSlot, setSelectingSlot] = useState<{
    loadoutId: string
    slotType: LoadoutSlotType
  } | null>(null)
  const [viewingItem, setViewingItem] = useState<LoadoutItem | null>(null)
  const [newLoadoutName, setNewLoadoutName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const lastPowerLevelLoadoutIdRef = useRef<string | null>(null)

  // Initialize from initialData on mount
  useEffect(() => {
    if (initialData) {
      // Initialize selected loadout from initial data
      const activeLoadout = initialData.loadouts.find(l => l.isActive) || initialData.loadouts[0]
      if (activeLoadout) {
        setSelectedLoadout(activeLoadout)
      }
    } else {
      // Load data if not provided
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Load power level only when selected loadout id changes (avoid duplicate requests)
  useEffect(() => {
    if (!selectedLoadout) return
    if (lastPowerLevelLoadoutIdRef.current === selectedLoadout.id) return
    lastPowerLevelLoadoutIdRef.current = selectedLoadout.id
    loadPowerLevel(selectedLoadout.id)
  }, [selectedLoadout?.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [loadoutsData, itemsData] = await Promise.all([
        loadoutApi.getLoadouts(),
        loadoutApi.getLoadoutItems(),
      ])
      setLoadouts(loadoutsData)
      setAvailableItems(itemsData)

      // Set active loadout as selected, or first loadout
      const activeLoadout = loadoutsData.find(l => l.isActive) || loadoutsData[0]
      if (activeLoadout) {
        setSelectedLoadout(activeLoadout)
      }
    } catch (error) {
      logger.error('Failed to load loadouts', error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }

  const loadPowerLevel = async (loadoutId: string) => {
    try {
      const power = await loadoutApi.getPowerLevel(loadoutId)
      setPowerLevel(power)
    } catch (error) {
      logger.error('Failed to load power level', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const handleCreateLoadout = async () => {
    if (!newLoadoutName.trim()) return

    try {
      const loadout = await loadoutApi.createLoadout({
        name: newLoadoutName,
        slots: [],
      })
      setLoadouts([...loadouts, loadout])
      setSelectedLoadout(loadout)
      setNewLoadoutName('')
      setShowCreateForm(false)
    } catch (error) {
      logger.error('Failed to create loadout', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const handleActivateLoadout = async (loadoutId: string) => {
    try {
      const updated = await loadoutApi.activateLoadout(loadoutId)
      setLoadouts(loadouts.map(l => ({
        ...l,
        isActive: l.id === loadoutId,
      })))
      setSelectedLoadout(updated)
    } catch (error) {
      logger.error('Failed to activate loadout', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const handleDeleteLoadout = async (loadoutId: string) => {
    const loadout = loadouts.find(l => l.id === loadoutId)
    if (loadout?.isPreset) {
      alert('Preset loadouts cannot be deleted. Create a custom loadout instead.')
      return
    }

    if (!confirm('Are you sure you want to delete this loadout?')) return

    try {
      await loadoutApi.deleteLoadout(loadoutId)
      setLoadouts(loadouts.filter(l => l.id !== loadoutId))
      if (selectedLoadout?.id === loadoutId) {
        const remaining = loadouts.filter(l => l.id !== loadoutId)
        setSelectedLoadout(remaining[0] || null)
      }
    } catch (error: any) {
      logger.error('Failed to delete loadout', error instanceof Error ? error : new Error(String(error)))
      if (error.message?.includes('Preset loadouts cannot be deleted')) {
        alert('Preset loadouts cannot be deleted.')
      }
    }
  }

  const handleSlotSelect = async (itemId: string) => {
    if (!selectingSlot || !selectedLoadout) return

    try {
      const currentSlots = selectedLoadout.slots.map(s => ({
        slotType: s.slotType,
        itemId: s.itemId,
      }))

      // Update or add slot
      const slotIndex = currentSlots.findIndex(s => s.slotType === selectingSlot.slotType)
      if (slotIndex >= 0) {
        currentSlots[slotIndex].itemId = itemId
      } else {
        currentSlots.push({
          slotType: selectingSlot.slotType,
          itemId,
        })
      }

      // Check if loadout is preset
      if (selectedLoadout.isPreset) {
        alert('Preset loadouts cannot be modified. Create a custom loadout to customize your setup.')
        setSelectingSlot(null)
        return
      }

      const updated = await loadoutApi.updateLoadout(selectedLoadout.id, {
        slots: currentSlots,
      })

      setLoadouts(loadouts.map(l => (l.id === updated.id ? updated : l)))
      setSelectedLoadout(updated)
      setSelectingSlot(null)
      lastPowerLevelLoadoutIdRef.current = updated.id
      loadPowerLevel(updated.id)
    } catch (error: any) {
      logger.error('Failed to update loadout', error instanceof Error ? error : new Error(String(error)))
      if (error.message?.includes('Preset loadouts cannot be modified')) {
        alert('Preset loadouts cannot be modified. Create a custom loadout instead.')
        setSelectingSlot(null)
      }
    }
  }

  const getSlotItem = (slotType: LoadoutSlotType): LoadoutItem | null => {
    if (!selectedLoadout) return null
    const slot = selectedLoadout.slots.find(s => s.slotType === slotType)
    return slot?.item || null
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading loadouts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold">Loadouts</h1>
        </div>
        <p className="text-gray-400">
          Configure your life skills and attributes to optimize your gameplay
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Loadout List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Loadouts</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                title="Create Custom Loadout"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {showCreateForm && (
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <input
                  type="text"
                  placeholder="Loadout name..."
                  value={newLoadoutName}
                  onChange={(e) => setNewLoadoutName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateLoadout()}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateLoadout}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewLoadoutName('')
                    }}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Preset Loadouts */}
              {loadouts.filter(l => l.isPreset).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    Preset Loadouts
                  </h3>
                  <div className="space-y-2">
                    {loadouts
                      .filter(l => l.isPreset)
                      .map((loadout) => (
                        <motion.div
                          key={loadout.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedLoadout?.id === loadout.id
                              ? 'bg-blue-500/20 border-blue-500/50'
                              : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedLoadout(loadout)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{loadout.name}</h3>
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                  Preset
                                </span>
                                {loadout.isActive && (
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {loadout.slots.length} / 6 slots filled
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!loadout.isActive && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleActivateLoadout(loadout.id)
                                  }}
                                  className="p-1.5 bg-green-600/20 hover:bg-green-600/30 rounded border border-green-500/30"
                                  title="Activate"
                                >
                                  <Check className="w-4 h-4 text-green-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* Custom Loadouts */}
              {loadouts.filter(l => !l.isPreset).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    Custom Loadouts
                  </h3>
                  <div className="space-y-2">
                    {loadouts
                      .filter(l => !l.isPreset)
                      .map((loadout) => (
                        <motion.div
                          key={loadout.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedLoadout?.id === loadout.id
                              ? 'bg-purple-500/20 border-purple-500/50'
                              : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedLoadout(loadout)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{loadout.name}</h3>
                                {loadout.isActive && (
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {loadout.slots.length} / 6 slots filled
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!loadout.isActive && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleActivateLoadout(loadout.id)
                                  }}
                                  className="p-1.5 bg-green-600/20 hover:bg-green-600/30 rounded border border-green-500/30"
                                  title="Activate"
                                >
                                  <Check className="w-4 h-4 text-green-400" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteLoadout(loadout.id)
                                }}
                                className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded border border-red-500/30"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {loadouts.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Loading preset loadouts...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Loadout Details */}
        <div className="lg:col-span-2">
          {selectedLoadout ? (
            <div className="space-y-6">
              {/* Power Level Display */}
              {powerLevel && <PowerLevelDisplay powerLevel={powerLevel} />}

              {/* Loadout Slots */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedLoadout.name}</h2>
                  {selectedLoadout.isPreset && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                      Preset Loadout (Read-only)
                    </span>
                  )}
                </div>
                {selectedLoadout.isPreset && (
                  <p className="text-sm text-gray-400 mb-4">
                    This is a preset loadout and cannot be modified. Create a custom loadout to customize your setup.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(LoadoutSlotType).map((slotType) => {
                    const item = getSlotItem(slotType)
                    return (
                      <div
                        key={slotType}
                        onClick={() => {
                          if (!selectedLoadout.isPreset) {
                            setSelectingSlot({ loadoutId: selectedLoadout.id, slotType })
                          }
                        }}
                        className={`p-4 rounded-lg border transition-all ${
                          selectedLoadout.isPreset
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:scale-105'
                        } ${
                          item
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm text-gray-300">
                            {SLOT_TYPE_LABELS[slotType]}
                          </h3>
                          {item && (
                            <span className="text-xs text-purple-400">
                              PL: {item.powerLevel}
                            </span>
                          )}
                        </div>
                        {item ? (
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingItem(item)
                              }}
                              className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                            >
                              Inspect item
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {selectedLoadout.isPreset ? 'Preset item' : 'Select item'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
              <p className="text-gray-400">Select a loadout to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* Item Selector Modal */}
      {selectingSlot && (
        <LoadoutItemSelector
          slotType={selectingSlot.slotType}
          items={availableItems.filter(item => item.slotType === selectingSlot.slotType)}
          onSelect={handleSlotSelect}
          onClose={() => setSelectingSlot(null)}
          onViewItem={setViewingItem}
        />
      )}

      {/* Item Details Modal */}
      {viewingItem && (
        <LoadoutItemModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}
    </div>
  )
}

