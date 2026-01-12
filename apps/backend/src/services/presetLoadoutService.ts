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
  // Get all default loadout items
  const allItems = await prisma.loadoutItem.findMany({
    where: { isDefault: true },
  })

  // Create a map for quick lookup
  const itemsMap = new Map<string, string>()
  for (const item of allItems) {
    const key = `${item.name}_${item.slotType}`
    itemsMap.set(key, item.id)
  }

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
 * Check if user needs preset loadouts and create them if needed
 */
export async function ensurePresetLoadouts(userId: string) {
  const existingLoadouts = await prisma.loadout.count({
    where: { userId },
  })

  if (existingLoadouts === 0) {
    return await createPresetLoadouts(userId)
  }

  return []
}





