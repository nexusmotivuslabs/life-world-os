/**
 * EnergyBoostRepositoryPort
 * 
 * Port (interface) for energy boost repository operations.
 * Defines contract for energy boost data persistence.
 */

import { EnergyBoost } from '../../domain/entities/EnergyBoost.js'

export interface EnergyBoostRepositoryPort {
  /**
   * Find energy boost by ID
   */
  findById(id: string): Promise<EnergyBoost | null>

  /**
   * Find all active energy boosts for a user
   */
  findActiveByUserId(userId: string): Promise<EnergyBoost[]>

  /**
   * Find all energy boosts for a user
   */
  findByUserId(userId: string): Promise<EnergyBoost[]>

  /**
   * Save energy boost (create or update)
   */
  save(boost: EnergyBoost): Promise<EnergyBoost>

  /**
   * Delete energy boost
   */
  delete(id: string): Promise<void>

  /**
   * Delete expired boosts for a user
   */
  deleteExpiredByUserId(userId: string): Promise<number>
}

