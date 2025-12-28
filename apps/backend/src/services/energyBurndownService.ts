/**
 * Energy Burndown Service
 * 
 * Handles live energy decay/burndown over time.
 * Energy continuously decreases from the time it was restored.
 */

import { prisma } from '../lib/prisma'

/**
 * Energy decay rate constants
 * Energy decays continuously over time from when it was restored
 */
export const ENERGY_DECAY_CONFIG = {
  // Base decay rate: energy lost per hour
  // Default: 2 energy per hour (48 hours to fully deplete 100 energy)
  BASE_DECAY_RATE_PER_HOUR: 2.0,
  
  // Minimum energy (never goes below this)
  MIN_ENERGY: 0,
  
  // Decay starts immediately after restoration
  // No grace period - energy starts decaying right away
} as const

/**
 * Calculate current energy based on time elapsed since restoration
 * 
 * @param restoredEnergy - The energy amount that was restored
 * @param restoredAt - Timestamp when energy was restored
 * @returns Current energy after decay
 */
export function calculateCurrentEnergy(
  restoredEnergy: number,
  restoredAt: Date
): number {
  const now = new Date()
  const hoursElapsed = (now.getTime() - restoredAt.getTime()) / (1000 * 60 * 60)
  
  // Calculate decay
  const energyDecayed = hoursElapsed * ENERGY_DECAY_CONFIG.BASE_DECAY_RATE_PER_HOUR
  
  // Calculate current energy
  const currentEnergy = Math.max(
    ENERGY_DECAY_CONFIG.MIN_ENERGY,
    restoredEnergy - energyDecayed
  )
  
  return Math.floor(currentEnergy) // Round down to integer
}

/**
 * Get energy burndown information
 * 
 * @param restoredEnergy - The energy amount that was restored
 * @param restoredAt - Timestamp when energy was restored
 * @returns Burndown information including current energy, decay rate, time until depletion
 */
export function getEnergyBurndownInfo(
  restoredEnergy: number,
  restoredAt: Date
): {
  currentEnergy: number
  restoredEnergy: number
  energyDecayed: number
  hoursElapsed: number
  decayRatePerHour: number
  hoursUntilDepletion: number | null // null if already depleted
  depletedAt: Date | null // null if already depleted or won't deplete
} {
  const now = new Date()
  const hoursElapsed = (now.getTime() - restoredAt.getTime()) / (1000 * 60 * 60)
  
  const energyDecayed = hoursElapsed * ENERGY_DECAY_CONFIG.BASE_DECAY_RATE_PER_HOUR
  const currentEnergy = Math.max(
    ENERGY_DECAY_CONFIG.MIN_ENERGY,
    restoredEnergy - energyDecayed
  )
  
  // Calculate time until depletion
  const remainingEnergy = Math.max(0, restoredEnergy - energyDecayed)
  const hoursUntilDepletion = remainingEnergy > 0
    ? remainingEnergy / ENERGY_DECAY_CONFIG.BASE_DECAY_RATE_PER_HOUR
    : null
  
  const depletedAt = hoursUntilDepletion !== null
    ? new Date(now.getTime() + hoursUntilDepletion * 60 * 60 * 1000)
    : null
  
  return {
    currentEnergy: Math.floor(currentEnergy),
    restoredEnergy,
    energyDecayed: Math.floor(energyDecayed),
    hoursElapsed: Math.round(hoursElapsed * 100) / 100, // Round to 2 decimals
    decayRatePerHour: ENERGY_DECAY_CONFIG.BASE_DECAY_RATE_PER_HOUR,
    hoursUntilDepletion: hoursUntilDepletion ? Math.round(hoursUntilDepletion * 100) / 100 : null,
    depletedAt,
  }
}

/**
 * Get or update energy restoration timestamp for a user
 * If energy was just restored (e.g., from sleep), update the timestamp
 */
export async function updateEnergyRestorationTimestamp(
  userId: string,
  restoredEnergy: number
): Promise<Date> {
  const now = new Date()
  
  await prisma.resources.update({
    where: { userId },
    data: {
      energyRestoredAt: now,
      energy: restoredEnergy, // Also update the stored energy value
    },
  })
  
  return now
}

/**
 * Get current live energy for a user
 * Calculates energy based on time elapsed since last restoration
 */
export async function getLiveEnergy(userId: string): Promise<{
  currentEnergy: number
  restoredEnergy: number
  restoredAt: Date | null
  burndown: ReturnType<typeof getEnergyBurndownInfo> | null
}> {
  const resources = await prisma.resources.findUnique({
    where: { userId },
    select: {
      energy: true,
      energyRestoredAt: true,
    },
  })
  
  if (!resources) {
    throw new Error('Resources not found')
  }
  
  // If no restoration timestamp exists, use current stored energy
  // This handles legacy data or initial state
  if (!resources.energyRestoredAt) {
    // Initialize restoration timestamp to now with current energy
    const now = new Date()
    await prisma.resources.update({
      where: { userId },
      data: {
        energyRestoredAt: now,
      },
    })
    
    return {
      currentEnergy: resources.energy ?? 100,
      restoredEnergy: resources.energy ?? 100,
      restoredAt: now,
      burndown: getEnergyBurndownInfo(resources.energy ?? 100, now),
    }
  }
  
  // Calculate live energy based on time elapsed
  const restoredEnergy = resources.energy ?? 100
  const burndown = getEnergyBurndownInfo(restoredEnergy, resources.energyRestoredAt)
  
  return {
    currentEnergy: burndown.currentEnergy,
    restoredEnergy,
    restoredAt: resources.energyRestoredAt,
    burndown,
  }
}


