/**
 * Money Value Object
 * 
 * Value object representing monetary amounts with currency.
 * Immutable and validates business rules.
 */

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    // Validate amount is a valid number
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a finite number')
    }

    // Validate currency code (basic validation)
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code')
    }
  }

  /**
   * Create a new Money value object
   */
  static create(amount: number, currency: string = 'USD'): Money {
    return new Money(amount, currency)
  }

  /**
   * Create Money from cents (for precise calculations)
   */
  static fromCents(cents: number, currency: string = 'USD'): Money {
    return new Money(cents / 100, currency)
  }

  /**
   * Add two Money amounts (must be same currency)
   */
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies')
    }

    return new Money(this.amount + other.amount, this.currency)
  }

  /**
   * Subtract two Money amounts (must be same currency)
   */
  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies')
    }

    return new Money(this.amount - other.amount, this.currency)
  }

  /**
   * Multiply by a number
   */
  multiply(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new Error('Factor must be a finite number')
    }

    return new Money(this.amount * factor, this.currency)
  }

  /**
   * Divide by a number
   */
  divide(divisor: number): Money {
    if (!Number.isFinite(divisor) || divisor === 0) {
      throw new Error('Divisor must be a non-zero finite number')
    }

    return new Money(this.amount / divisor, this.currency)
  }

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this.amount === 0
  }

  /**
   * Check if amount is positive
   */
  isPositive(): boolean {
    return this.amount > 0
  }

  /**
   * Check if amount is negative
   */
  isNegative(): boolean {
    return this.amount < 0
  }

  /**
   * Compare with another Money amount
   * Returns: -1 if less, 0 if equal, 1 if greater
   */
  compare(other: Money): number {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies')
    }

    if (this.amount < other.amount) return -1
    if (this.amount > other.amount) return 1
    return 0
  }

  /**
   * Format as string with currency symbol
   */
  toString(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount)
  }

  /**
   * Get amount as number (for calculations)
   */
  toNumber(): number {
    return this.amount
  }

  /**
   * Get amount in cents (for precise storage)
   */
  toCents(): number {
    return Math.round(this.amount * 100)
  }

  /**
   * Create a copy with new amount
   */
  withAmount(amount: number): Money {
    return new Money(amount, this.currency)
  }
}





