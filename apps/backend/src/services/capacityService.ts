/**
 * Capacity Service
 * 
 * Core Capacity state management and validation.
 * Capacity represents human operating stability (physical health, mental resilience,
 * cognitive efficiency, recovery elasticity).
 * 
 * Capacity is a state (0-100), not a resource to spend.
 * Capacity modifies outcomes, not costs.
 */

/**
 * Capacity range constants
 */
export const CAPACITY_CONSTANTS = {
  MIN: 0,
  MAX: 100,
  FLOOR: 20, // Decay stops at this floor
} as const

/**
 * Validate and clamp Capacity value to valid range
 * 
 * @param capacity - Capacity value to validate
 * @returns Clamped capacity value (0-100)
 */
export function validateCapacity(capacity: number): number {
  return Math.max(CAPACITY_CONSTANTS.MIN, Math.min(CAPACITY_CONSTANTS.MAX, capacity))
}

/**
 * Check if Capacity is at or below floor
 */
export function isAtCapacityFloor(capacity: number): boolean {
  return capacity <= CAPACITY_CONSTANTS.FLOOR
}

/**
 * Apply Capacity change with validation
 * 
 * @param currentCapacity - Current Capacity value
 * @param change - Amount to change (positive or negative)
 * @returns New Capacity value (clamped to 0-100)
 */
export function applyCapacityChange(currentCapacity: number, change: number): number {
  const newCapacity = currentCapacity + change
  return validateCapacity(newCapacity)
}

