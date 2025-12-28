/**
 * EnergyBoost Domain Entity
 * 
 * Pure business logic entity representing a temporary energy boost (caffeine, food, etc.).
 * These boosts add to current energy but don't restore base energy.
 */

export enum BoostType {
  CAFFEINE = 'CAFFEINE',
  FOOD = 'FOOD',
  SUPPLEMENT = 'SUPPLEMENT',
  OTHER = 'OTHER'
}

export class EnergyBoost {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: BoostType,
    public readonly amount: number, // Temporary energy added
    public readonly duration: number, // Minutes until decay starts
    public readonly decayRate: number, // Energy lost per hour after duration
    public readonly expiresAt: Date,
    public readonly createdAt: Date
  ) {
    // Validate amount
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Boost amount must be a non-negative number')
    }

    // Validate duration
    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error('Duration must be a non-negative number')
    }

    // Validate decay rate
    if (!Number.isFinite(decayRate) || decayRate < 0) {
      throw new Error('Decay rate must be a non-negative number')
    }
  }

  /**
   * Create a new EnergyBoost entity
   */
  static create(
    id: string,
    userId: string,
    type: BoostType,
    amount: number,
    duration: number, // minutes
    decayRate: number // energy per hour
  ): EnergyBoost {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000)

    return new EnergyBoost(
      id,
      userId,
      type,
      amount,
      duration,
      decayRate,
      expiresAt,
      now
    )
  }

  /**
   * Create EnergyBoost from persisted data
   */
  static fromPersistence(data: {
    id: string
    userId: string
    type: BoostType
    amount: number
    duration: number
    decayRate: number
    expiresAt: Date
    createdAt: Date
  }): EnergyBoost {
    return new EnergyBoost(
      data.id,
      data.userId,
      data.type,
      data.amount,
      data.duration,
      data.decayRate,
      data.expiresAt,
      data.createdAt
    )
  }

  /**
   * Calculate current boost amount based on time elapsed
   */
  getCurrentAmount(): number {
    const now = new Date()
    
    // If boost hasn't started decaying yet
    if (now < this.expiresAt) {
      return this.amount
    }

    // Calculate decay
    const hoursSinceExpiry = (now.getTime() - this.expiresAt.getTime()) / (1000 * 60 * 60)
    const decayed = hoursSinceExpiry * this.decayRate
    const remaining = Math.max(0, this.amount - decayed)

    return remaining
  }

  /**
   * Check if boost is still active
   */
  isActive(): boolean {
    return this.getCurrentAmount() > 0
  }

  /**
   * Check if boost has expired
   */
  isExpired(): boolean {
    const now = new Date()
    const hoursSinceExpiry = (now.getTime() - this.expiresAt.getTime()) / (1000 * 60 * 60)
    return hoursSinceExpiry > 0 && this.getCurrentAmount() === 0
  }

  /**
   * Get time until boost expires (in minutes)
   */
  getTimeUntilExpiry(): number {
    const now = new Date()
    if (now >= this.expiresAt) return 0
    return Math.ceil((this.expiresAt.getTime() - now.getTime()) / (1000 * 60))
  }
}

