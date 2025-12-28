/**
 * Sleep Domain Entity
 * 
 * Pure business logic entity representing a sleep log entry.
 * No infrastructure dependencies - pure TypeScript class.
 */

import { SleepQuality } from '../valueObjects/SleepQuality.js'
import { EnergyRestoration } from '../valueObjects/EnergyRestoration.js'

export class Sleep {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly date: Date,
    public readonly hoursSlept: number,
    public readonly quality: SleepQuality,
    public readonly bedTime: Date | null,
    public readonly wakeTime: Date | null,
    public readonly energyRestored: number,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    // Validate hours slept
    if (!Number.isFinite(hoursSlept) || hoursSlept < 0 || hoursSlept > 24) {
      throw new Error('Hours slept must be between 0 and 24')
    }

    // Validate bed/wake time consistency
    if (bedTime && wakeTime && wakeTime <= bedTime) {
      throw new Error('Wake time must be after bed time')
    }
  }

  /**
   * Create a new Sleep entity
   */
  static create(
    id: string,
    userId: string,
    date: Date,
    hoursSlept: number,
    quality: SleepQuality,
    capacityCap: number,
    bedTime: Date | null = null,
    wakeTime: Date | null = null,
    notes: string | null = null
  ): Sleep {
    // Calculate energy restoration
    const restoration = EnergyRestoration.calculate(hoursSlept, quality, capacityCap)

    return new Sleep(
      id,
      userId,
      date,
      hoursSlept,
      quality,
      bedTime,
      wakeTime,
      restoration.restorationAmount,
      notes,
      new Date(),
      new Date()
    )
  }

  /**
   * Create Sleep from persisted data (from repository)
   */
  static fromPersistence(data: {
    id: string
    userId: string
    date: Date
    hoursSlept: number
    quality: number
    bedTime: Date | null
    wakeTime: Date | null
    energyRestored: number
    notes: string | null
    createdAt: Date
    updatedAt: Date
  }): Sleep {
    const quality = SleepQuality.create(data.quality)
    
    return new Sleep(
      data.id,
      data.userId,
      data.date,
      data.hoursSlept,
      quality,
      data.bedTime,
      data.wakeTime,
      data.energyRestored,
      data.notes,
      data.createdAt,
      data.updatedAt
    )
  }

  /**
   * Check if sleep was optimal (7-9 hours, quality 8+)
   */
  isOptimal(): boolean {
    return this.hoursSlept >= 7 && 
           this.hoursSlept <= 9 && 
           this.quality.isOptimal()
  }

  /**
   * Get sleep category
   */
  getCategory(): 'insufficient' | 'short' | 'optimal' | 'long' {
    if (this.hoursSlept < 6) return 'insufficient'
    if (this.hoursSlept < 7) return 'short'
    if (this.hoursSlept <= 9) return 'optimal'
    return 'long'
  }

  /**
   * Get sleep duration in hours and minutes
   */
  getDurationFormatted(): string {
    const hours = Math.floor(this.hoursSlept)
    const minutes = Math.round((this.hoursSlept - hours) * 60)
    return `${hours}h ${minutes}m`
  }
}

