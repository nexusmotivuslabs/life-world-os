/**
 * SleepQuality Value Object
 * 
 * Value object representing sleep quality on a 1-10 scale.
 * Immutable and validates business rules.
 */

export class SleepQuality {
  private constructor(public readonly value: number) {
    // Validate quality is within valid range
    if (!Number.isFinite(value) || value < 1 || value > 10) {
      throw new Error('Sleep quality must be between 1 and 10')
    }
  }

  /**
   * Create a new SleepQuality value object
   */
  static create(value: number): SleepQuality {
    return new SleepQuality(value)
  }

  /**
   * Get quality category
   */
  getCategory(): 'poor' | 'fair' | 'good' | 'excellent' {
    if (this.value <= 3) return 'poor'
    if (this.value <= 5) return 'fair'
    if (this.value <= 8) return 'good'
    return 'excellent'
  }

  /**
   * Get quality multiplier for energy restoration
   * Higher quality = better restoration
   */
  getRestorationMultiplier(): number {
    // Quality multiplier: 0.5x to 1.5x based on quality (1-10 scale)
    return 0.5 + (this.value / 10) * 1.0
  }

  /**
   * Check if sleep quality is optimal (8+)
   */
  isOptimal(): boolean {
    return this.value >= 8
  }
}

