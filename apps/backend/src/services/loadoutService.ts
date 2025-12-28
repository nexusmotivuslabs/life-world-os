/**
 * Loadout Service
 * 
 * Business logic for loadout operations
 */

import { prisma } from '../lib/prisma'
import { LoadoutSlotType } from '@prisma/client'
import { ensurePresetLoadouts } from './presetLoadoutService'

export interface CreateLoadoutInput {
  name: string
  slots: {
    slotType: LoadoutSlotType
    itemId: string
  }[]
}

export interface UpdateLoadoutInput {
  name?: string
  slots?: {
    slotType: LoadoutSlotType
    itemId: string
  }[]
}

/**
 * Get all loadouts for a user
 * Automatically creates preset loadouts if user has none
 */
export async function getUserLoadouts(userId: string) {
  // Ensure user has preset loadouts if they have none
  await ensurePresetLoadouts(userId)

  return prisma.loadout.findMany({
    where: { userId },
    include: {
      slots: {
        include: {
          item: true,
        },
      },
    },
    orderBy: [
      { isPreset: 'asc' }, // Custom loadouts first
      { createdAt: 'asc' },
    ],
  })
}

/**
 * Get a single loadout by ID
 */
export async function getLoadoutById(loadoutId: string, userId: string) {
  return prisma.loadout.findFirst({
    where: {
      id: loadoutId,
      userId,
    },
    include: {
      slots: {
        include: {
          item: true,
        },
      },
    },
  })
}

/**
 * Get active loadout for a user
 * Automatically creates preset loadouts if user has none
 */
export async function getActiveLoadout(userId: string) {
  // Ensure user has preset loadouts if they have none
  await ensurePresetLoadouts(userId)

  return prisma.loadout.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      slots: {
        include: {
          item: true,
        },
      },
    },
  })
}

/**
 * Create a new loadout (custom loadout - not preset)
 */
export async function createLoadout(userId: string, data: CreateLoadoutInput) {
  // Ensure user has preset loadouts first
  await ensurePresetLoadouts(userId)

  // Custom loadouts are never active by default (user must activate manually)
  // unless user has no active loadout
  const activeLoadout = await prisma.loadout.findFirst({
    where: {
      userId,
      isActive: true,
    },
  })

  const isActive = !activeLoadout && data.slots.length > 0

  if (data.slots.length > 0) {
    return prisma.loadout.create({
      data: {
        userId,
        name: data.name,
        isPreset: false, // Custom loadout
        isActive,
        slots: {
          create: data.slots.map(slot => ({
            slotType: slot.slotType,
            itemId: slot.itemId,
          })),
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
  }

  return prisma.loadout.create({
    data: {
      userId,
      name: data.name,
      isPreset: false, // Custom loadout
      isActive: false,
    },
    include: {
      slots: {
        include: {
          item: true,
        },
      },
    },
  })
}

/**
 * Update a loadout
 * Preset loadouts cannot be modified (only custom loadouts)
 */
export async function updateLoadout(
  loadoutId: string,
  userId: string,
  data: UpdateLoadoutInput
) {
  // Verify ownership
  const existing = await prisma.loadout.findFirst({
    where: {
      id: loadoutId,
      userId,
    },
  })

  if (!existing) {
    throw new Error('Loadout not found')
  }

  // Prevent modification of preset loadouts
  if (existing.isPreset) {
    throw new Error('Preset loadouts cannot be modified. Create a custom loadout instead.')
  }

  // Update slots if provided
  if (data.slots) {
    // Delete existing slots
    await prisma.loadoutSlot.deleteMany({
      where: { loadoutId },
    })

    // Create new slots
    await prisma.loadoutSlot.createMany({
      data: data.slots.map(slot => ({
        loadoutId,
        slotType: slot.slotType,
        itemId: slot.itemId,
      })),
    })
  }

  // Update loadout
  return prisma.loadout.update({
    where: { id: loadoutId },
    data: {
      name: data.name,
    },
    include: {
      slots: {
        include: {
          item: true,
        },
      },
    },
  })
}

/**
 * Activate a loadout (deactivates all others)
 */
export async function activateLoadout(loadoutId: string, userId: string) {
  // Verify ownership
  const existing = await prisma.loadout.findFirst({
    where: {
      id: loadoutId,
      userId,
    },
  })

  if (!existing) {
    throw new Error('Loadout not found')
  }

  // Deactivate all other loadouts
  await prisma.loadout.updateMany({
    where: {
      userId,
      id: { not: loadoutId },
    },
    data: {
      isActive: false,
    },
  })

  // Activate this loadout
  return prisma.loadout.update({
    where: { id: loadoutId },
    data: {
      isActive: true,
    },
    include: {
      slots: {
        include: {
          item: true,
        },
      },
    },
  })
}

/**
 * Delete a loadout
 * Preset loadouts cannot be deleted (only custom loadouts)
 */
export async function deleteLoadout(loadoutId: string, userId: string) {
  // Verify ownership
  const existing = await prisma.loadout.findFirst({
    where: {
      id: loadoutId,
      userId,
    },
  })

  if (!existing) {
    throw new Error('Loadout not found')
  }

  // Prevent deletion of preset loadouts
  if (existing.isPreset) {
    throw new Error('Preset loadouts cannot be deleted')
  }

  return prisma.loadout.delete({
    where: { id: loadoutId },
  })
}

/**
 * Get all available loadout items
 */
export async function getLoadoutItems(slotType?: LoadoutSlotType) {
  return prisma.loadoutItem.findMany({
    where: slotType ? { slotType } : undefined,
    orderBy: [
      { isDefault: 'desc' },
      { powerLevel: 'desc' },
      { name: 'asc' },
    ],
  })
}

