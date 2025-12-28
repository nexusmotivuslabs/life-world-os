/**
 * BaseEnergy Value Object
 * 
 * Value object representing base energy - the foundational energy restored through sleep.
 * Immutable and validates business rules.
 */

export class BaseEnergy {
  private constructor(
    public readonly amount: number,
    public readonly cap: number // Capacity-modified cap
  ) {
    // Validate amount is within valid range
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Base energy amount must be a non-negative finite number')
    }

    // Validate cap is within valid range
    if (!Number.isFinite(cap) || cap < 0 || cap > 110) {
      throw new Error('Energy cap must be between 0 and 110')
    }

    // Amount cannot exceed cap
    if (amount > cap) {
      throw new Error('Base energy amount cannot exceed capacity-modified cap')
    }
  }

  /**
   * Create a new BaseEnergy value object
   */
  static create(amount: number, cap: number): BaseEnergy {
    return new BaseEnergy(amount, cap)
  }

  /**
   * Get the percentage of base energy relative to cap
   */
  getPercentage(): number {
    if (this.cap === 0) return 0
    return (this.amount / this.cap) * 100
  }

  /**
   * Check if base energy is at maximum (cap)
   */
  isAtMaximum(): boolean {
    return this.amount >= this.cap
  }

  /**
   * Check if base energy is critically low (< 25% of cap)
   */
  isCriticallyLow(): boolean {
    return this.getPercentage() < 25
  }

  /**
   * Get remaining energy capacity
   */
  getRemaining(): number {
    return Math.max(0, this.cap - this.amount)
  }
}

