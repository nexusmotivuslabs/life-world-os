/**
 * Capacity Modifier Service
 * 
 * Handles Capacity-based modifiers to XP gain and rewards.
 * Step 5: Capacity actively modifies outcomes based on canonical bands.
 * 
 * Bands are deliberate - no smoothing, no gradients.
 */

/**
 * Capacity band definitions (canonical)
 * 
 * Capacity 0-20: XP gain -40%, reward efficiency reduced
 * Capacity 21-40: XP gain -20%
 * Capacity 41-70: Normal outcomes
 * Capacity 71-85: Slight efficiency bonus
 * Capacity 86-100: Recovery and XP bonus (capped)
 */
export interface CapacityModifiers {
  xpEfficiency: number // Multiplier for XP gain (0.6 = -40%, 1.0 = normal, 1.1 = +10%)
  rewardEfficiency: number // Multiplier for rewards (resources, etc.)
}

/**
 * Get Capacity band modifiers
 * 
 * Bands are discrete - no smoothing or gradients.
 * 
 * @param capacity - Current Capacity strength (0-100)
 * @returns Capacity modifiers for XP and rewards
 */
export function getCapacityModifiers(capacity: number): CapacityModifiers {
  // Ensure capacity is within valid range
  const clampedCapacity = Math.max(0, Math.min(100, capacity))

  // Band definitions (canonical)
  if (clampedCapacity >= 0 && clampedCapacity <= 20) {
    // Capacity 0-20: XP gain -40%, reward efficiency reduced
    return {
      xpEfficiency: 0.6, // -40% (60% of normal)
      rewardEfficiency: 0.6, // Reduced reward efficiency
    }
  } else if (clampedCapacity >= 21 && clampedCapacity <= 40) {
    // Capacity 21-40: XP gain -20%
    return {
      xpEfficiency: 0.8, // -20% (80% of normal)
      rewardEfficiency: 0.9, // Slightly reduced reward efficiency
    }
  } else if (clampedCapacity >= 41 && clampedCapacity <= 70) {
    // Capacity 41-70: Normal outcomes
    return {
      xpEfficiency: 1.0, // Normal (100%)
      rewardEfficiency: 1.0, // Normal (100%)
    }
  } else if (clampedCapacity >= 71 && clampedCapacity <= 85) {
    // Capacity 71-85: Slight efficiency bonus
    return {
      xpEfficiency: 1.1, // +10% bonus
      rewardEfficiency: 1.05, // Slight reward bonus
    }
  } else {
    // Capacity 86-100: Recovery and XP bonus (capped)
    return {
      xpEfficiency: 1.15, // +15% bonus (capped)
      rewardEfficiency: 1.1, // Reward bonus
    }
  }
}

/**
 * Apply Capacity modifier to XP values
 * 
 * @param xp - Base XP value
 * @param capacity - Current Capacity strength (0-100)
 * @returns Modified XP value (rounded)
 */
export function applyCapacityModifierToXP(xp: number, capacity: number): number {
  const modifiers = getCapacityModifiers(capacity)
  return Math.round(xp * modifiers.xpEfficiency)
}

/**
 * Apply Capacity modifier to reward values
 * 
 * @param reward - Base reward value
 * @param capacity - Current Capacity strength (0-100)
 * @returns Modified reward value (rounded if applicable)
 */
export function applyCapacityModifierToReward(reward: number, capacity: number): number {
  const modifiers = getCapacityModifiers(capacity)
  return reward * modifiers.rewardEfficiency
}





