/**
 * Loadout Bonus Service
 * 
 * Applies loadout bonuses to game calculations
 */

import { getActiveLoadout } from './loadoutService'

export interface LoadoutBenefits {
  capacity?: number
  engines?: number
  oxygen?: number
  meaning?: number
  optionality?: number
  xpGain?: number
  energyEfficiency?: number
  energyCostReduction?: number
  [key: string]: any
}

export interface LoadoutBonuses {
  capacity?: number
  engines?: number
  oxygen?: number
  meaning?: number
  optionality?: number
  xpGain?: number // Percentage modifier (e.g., 0.05 = +5%)
  energyEfficiency?: number // Percentage modifier
  energyCostReduction?: number // Percentage reduction
}

/**
 * Get active loadout bonuses for a user
 */
export async function getActiveLoadoutBonuses(userId: string): Promise<LoadoutBonuses> {
  try {
    const loadout = await getActiveLoadout(userId)
    
    if (!loadout || loadout.slots.length === 0) {
      return {}
    }

    // Aggregate benefits from all items in the loadout
    const bonuses: LoadoutBonuses = {
      capacity: 0,
      engines: 0,
      oxygen: 0,
      meaning: 0,
      optionality: 0,
      xpGain: 0,
      energyEfficiency: 0,
      energyCostReduction: 0,
    }

    for (const slot of loadout.slots) {
      const benefits = slot.item.benefits as LoadoutBenefits
      
      if (benefits) {
        if (typeof benefits.capacity === 'number') {
          bonuses.capacity = (bonuses.capacity || 0) + benefits.capacity
        }
        if (typeof benefits.engines === 'number') {
          bonuses.engines = (bonuses.engines || 0) + benefits.engines
        }
        if (typeof benefits.oxygen === 'number') {
          bonuses.oxygen = (bonuses.oxygen || 0) + benefits.oxygen
        }
        if (typeof benefits.meaning === 'number') {
          bonuses.meaning = (bonuses.meaning || 0) + benefits.meaning
        }
        if (typeof benefits.optionality === 'number') {
          bonuses.optionality = (bonuses.optionality || 0) + benefits.optionality
        }
        if (typeof benefits.xpGain === 'number') {
          bonuses.xpGain = (bonuses.xpGain || 0) + benefits.xpGain
        }
        if (typeof benefits.energyEfficiency === 'number') {
          bonuses.energyEfficiency = (bonuses.energyEfficiency || 0) + benefits.energyEfficiency
        }
        if (typeof benefits.energyCostReduction === 'number') {
          bonuses.energyCostReduction = (bonuses.energyCostReduction || 0) + benefits.energyCostReduction
        }
      }
    }

    // Remove zero values for cleaner return
    Object.keys(bonuses).forEach(key => {
      if (bonuses[key as keyof LoadoutBonuses] === 0) {
        delete bonuses[key as keyof LoadoutBonuses]
      }
    })

    return bonuses
  } catch (error) {
    console.error('Failed to get loadout bonuses:', error)
    return {}
  }
}

/**
 * Apply loadout bonuses to a stat value
 */
export function applyLoadoutBonusToStat(baseValue: number, bonus: number | undefined): number {
  if (!bonus) return baseValue
  return baseValue + bonus
}

/**
 * Apply loadout XP gain modifier
 */
export function applyLoadoutXPModifier(baseXP: number, xpGainBonus: number | undefined): number {
  if (!xpGainBonus) return baseXP
  return Math.round(baseXP * (1 + xpGainBonus))
}

/**
 * Apply loadout energy cost reduction
 */
export function applyLoadoutEnergyReduction(baseCost: number, reductionBonus: number | undefined): number {
  if (!reductionBonus) return baseCost
  const reduction = baseCost * reductionBonus
  return Math.max(0, Math.round(baseCost - reduction))
}

/**
 * Apply loadout energy efficiency bonus
 * This affects usable energy calculation
 */
export function applyLoadoutEnergyEfficiency(baseEnergy: number, efficiencyBonus: number | undefined): number {
  if (!efficiencyBonus) return baseEnergy
  return Math.round(baseEnergy * (1 + efficiencyBonus))
}

