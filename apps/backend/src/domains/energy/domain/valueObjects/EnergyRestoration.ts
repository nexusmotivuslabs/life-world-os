/**
 * EnergyRestoration Value Object
 * 
 * Value object representing energy restoration from sleep.
 * Calculates restoration based on sleep hours and quality.
 */

import { SleepQuality } from './SleepQuality.js'

export class EnergyRestoration {
  private constructor(
    public readonly hoursSlept: number,
    public readonly quality: SleepQuality,
    public readonly restorationAmount: number
  ) {}

  /**
   * Calculate energy restoration from sleep
   */
  static calculate(
    hoursSlept: number,
    quality: SleepQuality,
    capacityCap: number
  ): EnergyRestoration {
    // Validate hours slept
    if (!Number.isFinite(hoursSlept) || hoursSlept < 0 || hoursSlept > 24) {
      throw new Error('Hours slept must be between 0 and 24')
    }

    // Base restoration: 1 energy per hour of sleep (max 8 hours = 8 base)
    const baseRestoration = Math.min(hoursSlept, 8) * 1

    // Quality multiplier: 0.5x to 1.5x based on quality (1-10 scale)
    const qualityMultiplier = quality.getRestorationMultiplier()

    // Optimal sleep (7-9 hours, quality 8+) gets bonus
    const isOptimal = hoursSlept >= 7 && hoursSlept <= 9 && quality.isOptimal()
    const optimalBonus = isOptimal ? 20 : 0

    // Calculate restoration (capped at Capacity-modified cap)
    const restoration = Math.floor(baseRestoration * qualityMultiplier) + optimalBonus
    const cappedRestoration = Math.min(restoration, capacityCap)

    return new EnergyRestoration(hoursSlept, quality, cappedRestoration)
  }

  /**
   * Get restoration percentage of capacity cap
   */
  getRestorationPercentage(capacityCap: number): number {
    if (capacityCap === 0) return 0
    return (this.restorationAmount / capacityCap) * 100
  }

  /**
   * Check if restoration is optimal (full restoration)
   */
  isOptimalRestoration(capacityCap: number): boolean {
    return this.restorationAmount >= capacityCap * 0.9 // 90% or more
  }
}

