/**
 * Preset Loadout Service
 * 
 * Creates and manages preset loadouts for users
 */

import { prisma } from '../lib/prisma'
import { LoadoutSlotType } from '@prisma/client'

/**
 * Preset loadout definitions
 * 5 natural loadouts with different playstyles
 */
const PRESET_LOADOUTS = [
  {
    name: 'The Balanced',
    description: 'A well-rounded loadout for steady progress across all areas',
    slots: [
      { slotType: LoadoutSlotType.PRIMARY_WEAPON, itemName: 'Resilience' },
      { slotType: LoadoutSlotType.SECONDARY_WEAPON, itemName: 'Patience' },
      { slotType: LoadoutSlotType.GRENADE, itemName: 'Quick Recovery' },
      { slotType: LoadoutSlotType.ARMOR_ABILITY, itemName: 'Regeneration' },
      { slotType: LoadoutSlotType.TACTICAL_PACKAGE, itemName: 'Synergy' },
      { slotType: LoadoutSlotType.SUPPORT_UPGRADE, itemName: 'Balance' },
    ],
  },
  {
    name: 'The Warrior',
    description: 'Aggressive build focused on high XP gain and action efficiency',
    slots: [
      { slotType: LoadoutSlotType.PRIMARY_WEAPON, itemName: 'Determination' },
      { slotType: LoadoutSlotType.SECONDARY_WEAPON, itemName: 'Courage' },
      { slotType: LoadoutSlotType.GRENADE, itemName: 'Momentum Shift' },
      { slotType: LoadoutSlotType.ARMOR_ABILITY, itemName: 'Shield' },
      { slotType: LoadoutSlotType.TACTICAL_PACKAGE, itemName: 'Optimization' },
      { slotType: LoadoutSlotType.SUPPORT_UPGRADE, itemName: 'Motivation' },
    ],
  },
  {
    name: 'The Strategist',
    description: 'Focus on energy efficiency and long-term capacity management',
    slots: [
      { slotType: LoadoutSlotType.PRIMARY_WEAPON, itemName: 'Focus' },
      { slotType: LoadoutSlotType.SECONDARY_WEAPON, itemName: 'Adaptability' },
      { slotType: LoadoutSlotType.GRENADE, itemName: 'Energy Boost' },
      { slotType: LoadoutSlotType.ARMOR_ABILITY, itemName: 'Fortification' },
      { slotType: LoadoutSlotType.TACTICAL_PACKAGE, itemName: 'Efficiency' },
      { slotType: LoadoutSlotType.SUPPORT_UPGRADE, itemName: 'Clarity' },
    ],
  },
  {
    name: 'The Guardian',
    description: 'Defensive build prioritizing capacity and protection',
    slots: [
      { slotType: LoadoutSlotType.PRIMARY_WEAPON, itemName: 'Resilience' },
      { slotType: LoadoutSlotType.SECONDARY_WEAPON, itemName: 'Patience' },
      { slotType: LoadoutSlotType.GRENADE, itemName: 'Quick Recovery' },
      { slotType: LoadoutSlotType.ARMOR_ABILITY, itemName: 'Fortification' },
      { slotType: LoadoutSlotType.TACTICAL_PACKAGE, itemName: 'Synergy' },
      { slotType: LoadoutSlotType.SUPPORT_UPGRADE, itemName: 'Balance' },
    ],
  },
  {
    name: 'The Explorer',
    description: 'Build focused on optionality and discovering new opportunities',
    slots: [
      { slotType: LoadoutSlotType.PRIMARY_WEAPON, itemName: 'Discipline' },
      { slotType: LoadoutSlotType.SECONDARY_WEAPON, itemName: 'Courage' },
      { slotType: LoadoutSlotType.GRENADE, itemName: 'Momentum Shift' },
      { slotType: LoadoutSlotType.ARMOR_ABILITY, itemName: 'Shield' },
      { slotType: LoadoutSlotType.TACTICAL_PACKAGE, itemName: 'Optimization' },
      { slotType: LoadoutSlotType.SUPPORT_UPGRADE, itemName: 'Clarity' },
    ],
  },
]

/**
 * Create preset loadouts for a user
 * Called when user has no loadouts
 */
export async function createPresetLoadouts(userId: string) {
  const itemsMap = await getDefaultItemsMap()
  const createdLoadouts = []

  for (let i = 0; i < PRESET_LOADOUTS.length; i++) {
    const preset = PRESET_LOADOUTS[i]
    
    // Find item IDs for this preset
    const slots = []
    for (const slot of preset.slots) {
      const key = `${slot.itemName}_${slot.slotType}`
      const itemId = itemsMap.get(key)
      
      if (!itemId) {
        console.warn(`Item not found: ${slot.itemName} (${slot.slotType})`)
        continue
      }
      
      slots.push({
        slotType: slot.slotType,
        itemId,
      })
    }

    // First preset loadout becomes active by default
    const isActive = i === 0

    const loadout = await prisma.loadout.create({
      data: {
        userId,
        name: preset.name,
        isPreset: true,
        isActive,
        slots: {
          create: slots,
        },
      },
      include: {
        slots: {
          include: {
            item: true,
          },
        },
      },
    })

    createdLoadouts.push(loadout)
  }

  return createdLoadouts
}

/**
 * Build a map of itemName_slotType -> itemId for default loadout items
 */
async function getDefaultItemsMap(): Promise<Map<string, string>> {
  const allItems = await prisma.loadoutItem.findMany({
    where: { isDefault: true },
  })
  const map = new Map<string, string>()
  for (const item of allItems) {
    map.set(`${item.name}_${item.slotType}`, item.id)
  }
  return map
}

/**
 * Fill empty slots on preset loadouts (e.g. created before loadout items were seeded).
 * Idempotent: only creates missing slots.
 */
export async function fillEmptyPresetSlots(userId: string): Promise<number> {
  const presetLoadouts = await prisma.loadout.findMany({
    where: { userId, isPreset: true },
    include: { slots: true },
  })
  if (presetLoadouts.length === 0) return 0

  const itemsMap = await getDefaultItemsMap()
  let filled = 0

  for (const loadout of presetLoadouts) {
    const presetDef = PRESET_LOADOUTS.find((p) => p.name === loadout.name)
    if (!presetDef) continue

    const existingSlotTypes = new Set(loadout.slots.map((s) => s.slotType))
    const toCreate: { slotType: LoadoutSlotType; itemId: string }[] = []

    for (const slot of presetDef.slots) {
      if (existingSlotTypes.has(slot.slotType)) continue
      const itemId = itemsMap.get(`${slot.itemName}_${slot.slotType}`)
      if (!itemId) {
        console.warn(`Preset backfill: item not found: ${slot.itemName} (${slot.slotType})`)
        continue
      }
      toCreate.push({ slotType: slot.slotType, itemId })
    }

    for (const s of toCreate) {
      await prisma.loadoutSlot.create({
        data: { loadoutId: loadout.id, slotType: s.slotType, itemId: s.itemId },
      })
      filled++
    }
  }

  return filled
}

/**
 * Check if user needs preset loadouts and create them if needed.
 * Also backfills empty slots on existing preset loadouts (e.g. after seed runs).
 */
export async function ensurePresetLoadouts(userId: string) {
  const existingLoadouts = await prisma.loadout.count({
    where: { userId },
  })

  if (existingLoadouts === 0) {
    return await createPresetLoadouts(userId)
  }

  await fillEmptyPresetSlots(userId)
  return []
}





