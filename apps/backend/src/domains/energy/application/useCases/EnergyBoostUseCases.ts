/**
 * Energy Boost Use Cases
 * 
 * Application layer use cases for energy boost operations.
 */

import { EnergyBoost, BoostType } from '../../domain/entities/EnergyBoost.js'
import { EnergyBoostRepositoryPort } from '../ports/EnergyBoostRepositoryPort.js'

export class CreateEnergyBoostUseCase {
  constructor(private boostRepository: EnergyBoostRepositoryPort) {}

  async execute(
    userId: string,
    type: BoostType,
    amount: number,
    duration: number, // minutes
    decayRate: number // energy per hour
  ): Promise<EnergyBoost> {
    const boost = EnergyBoost.create(
      `boost-${userId}-${Date.now()}`,
      userId,
      type,
      amount,
      duration,
      decayRate
    )

    return this.boostRepository.save(boost)
  }
}

export class GetActiveBoostsUseCase {
  constructor(private boostRepository: EnergyBoostRepositoryPort) {}

  async execute(userId: string): Promise<EnergyBoost[]> {
    const boosts = await this.boostRepository.findActiveByUserId(userId)
    // Filter to only active boosts (not expired)
    return boosts.filter(boost => boost.isActive())
  }
}

export class CleanupExpiredBoostsUseCase {
  constructor(private boostRepository: EnergyBoostRepositoryPort) {}

  async execute(userId: string): Promise<number> {
    return this.boostRepository.deleteExpiredByUserId(userId)
  }
}

