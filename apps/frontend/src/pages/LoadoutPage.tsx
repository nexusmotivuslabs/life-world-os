/**
 * Loadout Page
 *
 * Main page for managing loadouts - similar to COD/Halo loadout system.
 * Follows the same template as other planes: load data in useEffect on mount,
 * with loading and error state and retry (no separate loader component).
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { Target, Plus, Trash2, Check, Pencil, X } from 'lucide-react'
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

export default function LoadoutPage() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([])
  const [selectedLoadout, setSelectedLoadout] = useState<Loadout | null>(null)
  const [availableItems, setAvailableItems] = useState<LoadoutItem[]>([])
  const [powerLevel, setPowerLevel] = useState<PowerLevelBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectingSlot, setSelectingSlot] = useState<{
    loadoutId: string
    slotType: LoadoutSlotType
  } | null>(null)
  const [viewingItem, setViewingItem] = useState<LoadoutItem | null>(null)
  const [newLoadoutName, setNewLoadoutName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [renamingLoadoutId, setRenamingLoadoutId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const lastPowerLevelLoadoutIdRef = useRef<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [loadoutsData, itemsData] = await Promise.all([
        loadoutApi.getLoadouts(),
        loadoutApi.getLoadoutItems(),
      ])
      setLoadouts(loadoutsData)
      setAvailableItems(itemsData)
      const activeLoadout = loadoutsData.find(l => l.isActive) || loadoutsData[0]
      if (activeLoadout) {
        setSelectedLoadout(activeLoadout)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load loadouts'
      setError(message)
      logger.error('Failed to load loadouts', err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Fetch power level only when selected loadout id changes (avoids duplicate requests)
  useEffect(() => {
    if (!selectedLoadout) return
    if (lastPowerLevelLoadoutIdRef.current === selectedLoadout.id) return
    lastPowerLevelLoadoutIdRef.current = selectedLoadout.id
    loadPowerLevel(selectedLoadout.id)
  }, [selectedLoadout])

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

  const handleRenameLoadout = async (loadoutId: string, newName: string) => {
    if (!newName.trim()) return

    const loadout = loadouts.find(l => l.id === loadoutId)
    if (loadout?.isPreset) {
      alert('Preset loadouts cannot be renamed. Create a custom loadout instead.')
      return
    }

    try {
      const updated = await loadoutApi.updateLoadout(loadoutId, { name: newName.trim() })
      setLoadouts(loadouts.map(l => (l.id === updated.id ? updated : l)))
      if (selectedLoadout?.id === loadoutId) {
        setSelectedLoadout(updated)
      }
      setRenamingLoadoutId(null)
      setRenameValue('')
    } catch (error: any) {
      logger.error('Failed to rename loadout', error instanceof Error ? error : new Error(String(error)))
      if (error.message?.includes('Preset loadouts cannot be modified')) {
        alert('Preset loadouts cannot be renamed.')
      }
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
      // Refetch power level after slot change (same loadout id, new slots)
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

  /** Star rating 1–5 from power level (0–500 scale) */
  const getStars = (powerLevel: number) => {
    const capped = Math.min(500, Math.max(0, powerLevel))
    return Math.max(1, Math.ceil((capped / 500) * 5))
  }

  const renderSlotCard = (
    slotType: LoadoutSlotType,
    size: 'primary' | 'secondary' | 'tertiary'
  ) => {
    const item = getSlotItem(slotType)
    const isPreset = selectedLoadout?.isPreset ?? false
    const canEdit = selectedLoadout && !isPreset
    const levelPct = item ? Math.min(100, (item.powerLevel / 500) * 100) : 0
    const stars = item ? getStars(item.powerLevel) : 0

    const handleClick = () => {
      if (canEdit) setSelectingSlot({ loadoutId: selectedLoadout!.id, slotType })
    }

    const baseCardClass = `rounded-lg border transition-all ${
      isPreset ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.02]'
    } ${item ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`

    const content = (
      <>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
            {SLOT_TYPE_LABELS[slotType]}
          </span>
          {item && (
            <span className="text-xs font-mono text-purple-400">LVL{item.powerLevel}</span>
          )}
        </div>
        {item ? (
          <>
            <div className="mb-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`text-sm ${i <= stars ? 'text-amber-400' : 'text-gray-600'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="font-semibold text-white truncate">{item.name}</p>
            {size === 'primary' && (
              <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full"
                  style={{ width: `${levelPct}%` }}
                />
              </div>
            )}
            {size !== 'primary' && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setViewingItem(item)
              }}
              className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-500/60 rounded px-2 py-1"
            >
              Inspect
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-500 py-1">
            {isPreset ? 'Preset item' : '+ Click to select'}
          </p>
        )}
      </>
    )

    if (size === 'primary') {
      return (
        <div
          key={slotType}
          onClick={handleClick}
          className={`${baseCardClass} p-6 min-h-[180px] flex flex-col`}
        >
          {content}
        </div>
      )
    }
    return (
      <div
        key={slotType}
        onClick={handleClick}
        className={`${baseCardClass} p-4 min-h-[120px] flex flex-col`}
      >
        {content}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-400 text-xl mb-2">Error loading loadouts</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => loadData()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
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
                          onClick={() => !renamingLoadoutId && setSelectedLoadout(loadout)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              {renamingLoadoutId === loadout.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRenameLoadout(loadout.id, renameValue)
                                      if (e.key === 'Escape') {
                                        setRenamingLoadoutId(null)
                                        setRenameValue('')
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleRenameLoadout(loadout.id, renameValue)}
                                    className="p-1.5 bg-purple-600/20 hover:bg-purple-600/30 rounded border border-purple-500/30"
                                    title="Save"
                                  >
                                    <Check className="w-4 h-4 text-purple-400" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRenamingLoadoutId(null)
                                      setRenameValue('')
                                    }}
                                    className="p-1.5 bg-gray-600/20 hover:bg-gray-600/30 rounded border border-gray-500/30"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4 text-gray-400" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold truncate">{loadout.name}</h3>
                                  {loadout.isActive && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                                      Active
                                    </span>
                                  )}
                                </div>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {loadout.slots.length} / 6 slots filled
                              </p>
                            </div>
                            {renamingLoadoutId !== loadout.id && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setRenamingLoadoutId(loadout.id)
                                    setRenameValue(loadout.name)
                                  }}
                                  className="p-1.5 bg-amber-600/20 hover:bg-amber-600/30 rounded border border-amber-500/30"
                                  title="Rename"
                                >
                                  <Pencil className="w-4 h-4 text-amber-400" />
                                </button>
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
                            )}
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

              {/* Loadout Slots - COD-style layout */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-0.5">
                    Loadouts
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {renamingLoadoutId === selectedLoadout.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameLoadout(selectedLoadout.id, renameValue)
                              if (e.key === 'Escape') {
                                setRenamingLoadoutId(null)
                                setRenameValue('')
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xl font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenameLoadout(selectedLoadout.id, renameValue)}
                            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                            title="Save"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setRenamingLoadoutId(null)
                              setRenameValue('')
                            }}
                            className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-2xl font-bold text-white truncate">{selectedLoadout.name}</h2>
                          {!selectedLoadout.isPreset && (
                            <button
                              onClick={() => {
                                setRenamingLoadoutId(selectedLoadout.id)
                                setRenameValue(selectedLoadout.name)
                              }}
                              className="p-2 bg-amber-600/20 hover:bg-amber-600/30 rounded-lg border border-amber-500/30"
                              title="Rename loadout"
                            >
                              <Pencil className="w-5 h-5 text-amber-400" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {selectedLoadout.isPreset && renamingLoadoutId !== selectedLoadout.id && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                        Preset (Read-only)
                      </span>
                    )}
                  </div>
                </div>
                {selectedLoadout.isPreset && (
                  <p className="text-sm text-gray-400 mb-4">
                    This is a preset loadout and cannot be modified. Create a custom loadout to customize your setup.
                  </p>
                )}
                {!selectedLoadout.isPreset && (
                  <p className="text-sm text-gray-400 mb-4">
                    Click a slot to select a weapon or armour item; the selected item is saved to this loadout.
                  </p>
                )}

                {/* Primary weapon - large top card */}
                <div className="mb-4">
                  {renderSlotCard(LoadoutSlotType.PRIMARY_WEAPON, 'primary')}
                </div>

                {/* Secondary + Grenade row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {renderSlotCard(LoadoutSlotType.SECONDARY_WEAPON, 'secondary')}
                  {renderSlotCard(LoadoutSlotType.GRENADE, 'secondary')}
                </div>

                {/* Armor, Tactical, Support row */}
                <div className="grid grid-cols-3 gap-4">
                  {renderSlotCard(LoadoutSlotType.ARMOR_ABILITY, 'tertiary')}
                  {renderSlotCard(LoadoutSlotType.TACTICAL_PACKAGE, 'tertiary')}
                  {renderSlotCard(LoadoutSlotType.SUPPORT_UPGRADE, 'tertiary')}
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

