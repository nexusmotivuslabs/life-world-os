/**
 * EnergyCalculationService
 * 
 * Domain service for calculating energy-related values.
 * Pure business logic - no infrastructure dependencies.
 */

import { BaseEnergy } from '../valueObjects/BaseEnergy.js'
import { EnergyRestoration } from '../valueObjects/EnergyRestoration.js'
import { SleepQuality } from '../valueObjects/SleepQuality.js'

export class EnergyCalculationService {
  /**
   * Calculate usable energy cap based on Capacity stat
   * From MECHANICS_BASELINE.md:
   * - Capacity < 30: usable energy capped at 70
   * - Capacity 30–60: usable energy capped at 85
   * - Capacity 60–80: usable energy capped at 100
   * - Capacity > 80: usable energy capped at 110 (soft bonus)
   */
  static calculateUsableEnergyCap(capacity: number): number {
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
   * Calculate energy restoration from sleep
   */
  static calculateEnergyRestoration(
    hoursSlept: number,
    quality: SleepQuality,
    capacityCap: number
  ): EnergyRestoration {
    return EnergyRestoration.calculate(hoursSlept, quality, capacityCap)
  }

  /**
   * Calculate total usable energy (base + temporary boosts)
   */
  static calculateTotalUsableEnergy(
    baseEnergy: number,
    temporaryBoosts: number[],
    capacityCap: number,
    isInBurnout: boolean
  ): number {
    // Burnout reduces energy cap significantly (40)
    if (isInBurnout) {
      const burnoutCap = 40
      const total = baseEnergy + temporaryBoosts.reduce((sum, boost) => sum + boost, 0)
      return Math.min(total, burnoutCap)
    }

    // Calculate total with boosts, capped by capacity
    const total = baseEnergy + temporaryBoosts.reduce((sum, boost) => sum + boost, 0)
    return Math.min(total, capacityCap)
  }

  /**
   * Calculate XP efficiency modifier based on Capacity
   * From MECHANICS_BASELINE.md:
   * - Capacity < 30: 70% efficiency
   * - Capacity 30–60: 85% efficiency
   * - Capacity 60–80: 100% efficiency
   * - Capacity > 80: 110% efficiency
   */
  static calculateXPEfficiency(capacity: number): number {
    if (capacity < 30) {
      return 0.70
    } else if (capacity < 60) {
      return 0.85
    } else if (capacity < 80) {
      return 1.0
    } else {
      return 1.10
    }
  }
}

