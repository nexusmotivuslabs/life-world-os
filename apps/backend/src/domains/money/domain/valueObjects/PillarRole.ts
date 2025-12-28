/**
 * PillarRole Value Object
 * 
 * Represents the role/purpose of a money system pillar.
 * This is a value object - immutable and compared by value.
 */

export enum CashflowLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE',
}

export enum VolatilityLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum InflationProtectionLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export class PillarRole {
  private constructor(
    public readonly primaryJob: string,
    public readonly cashflow: CashflowLevel,
    public readonly volatility: VolatilityLevel,
    public readonly inflationProtection: InflationProtectionLevel
  ) {}

  static create(
    primaryJob: string,
    cashflow: CashflowLevel,
    volatility: VolatilityLevel,
    inflationProtection: InflationProtectionLevel
  ): PillarRole {
    if (!primaryJob || primaryJob.trim().length === 0) {
      throw new Error('Primary job cannot be empty')
    }

    return new PillarRole(primaryJob, cashflow, volatility, inflationProtection)
  }

  /**
   * Create from persistence data
   */
  static fromPersistence(data: {
    primaryJob: string
    cashflow: CashflowLevel
    volatility: VolatilityLevel
    inflationProtection: InflationProtectionLevel
  }): PillarRole {
    return new PillarRole(
      data.primaryJob,
      data.cashflow,
      data.volatility,
      data.inflationProtection
    )
  }

  /**
   * Check if two roles are equal
   */
  equals(other: PillarRole): boolean {
    return (
      this.primaryJob === other.primaryJob &&
      this.cashflow === other.cashflow &&
      this.volatility === other.volatility &&
      this.inflationProtection === other.inflationProtection
    )
  }
}


