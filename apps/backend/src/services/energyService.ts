/**
 * Energy Service
 * 
 * Handles energy calculations, Capacity-based capping, and energy management.
 * Energy is a first-class resource that constrains all actions.
 */

/**
 * Calculate usable energy cap based on Capacity stat
 * 
 * From MECHANICS_BASELINE.md:
 * - Capacity < 30: usable energy capped at 70
 * - Capacity 30–60: usable energy capped at 85
 * - Capacity 60–80: usable energy capped at 100
 * - Capacity > 80: usable energy capped at 110 (soft bonus)
 */
export function calculateUsableEnergyCap(capacity: number): number {
  if (capacity < 30) {
    return 70
  } else if (capacity < 60) {
    return 85
  } else if (capacity < 80) {
    return 100
  } else {
    return 110
  }
}

/**
 * Get effective usable energy (current energy, capped by Capacity and Burnout)
 * 
 * Step 6: During burnout, energy cap is reduced significantly (40) regardless of Capacity
 */
export function getEffectiveEnergy(
  currentEnergy: number,
  capacity: number,
  isInBurnout: boolean = false
): number {
  // Step 6: Burnout reduces energy cap significantly (40)
  if (isInBurnout) {
    return Math.min(currentEnergy, 40)
  }

  const cap = calculateUsableEnergyCap(capacity)
  return Math.min(currentEnergy, cap)
}

/**
 * Base daily energy budget
 */
export const BASE_DAILY_ENERGY = 100

/**
 * Action energy costs (from MECHANICS_BASELINE.md)
 * 
 * Note: SEASON_COMPLETION and MILESTONE are special system events that don't consume player energy.
 * They represent automatic achievements, not player actions.
 */
export const ACTION_ENERGY_COSTS = {
  WORK_PROJECT: 30,
  EXERCISE: 25,
  LEARNING: 20,
  SAVE_EXPENSES: 15,
  REST: 18, // Recovery action - consumes energy, grants no XP, improves Capacity
  CUSTOM: 20,
  // System events (no energy cost, triggered automatically)
  SEASON_COMPLETION: 0,
  MILESTONE: 0,
} as const

/**
 * Get energy cost for an action type
 * 
 * System events (SEASON_COMPLETION, MILESTONE) return 0 as they are automatic.
 * Unknown types default to CUSTOM cost (20).
 */
export function getActionEnergyCost(actionType: string): number {
  // System events don't consume energy
  if (actionType === 'SEASON_COMPLETION' || actionType === 'MILESTONE') {
    return 0
  }
  
  return ACTION_ENERGY_COSTS[actionType as keyof typeof ACTION_ENERGY_COSTS] ?? ACTION_ENERGY_COSTS.CUSTOM
}

