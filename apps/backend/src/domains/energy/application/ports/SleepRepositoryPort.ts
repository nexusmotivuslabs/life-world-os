/**
 * SleepRepositoryPort
 * 
 * Port (interface) for sleep repository operations.
 * Defines contract for sleep data persistence.
 */

import { Sleep } from '../../domain/entities/Sleep.js'

export interface SleepRepositoryPort {
  /**
   * Find sleep log by ID
   */
  findById(id: string): Promise<Sleep | null>

  /**
   * Find sleep log by user ID and date
   */
  findByUserIdAndDate(userId: string, date: Date): Promise<Sleep | null>

  /**
   * Find all sleep logs for a user
   */
  findByUserId(userId: string): Promise<Sleep[]>

  /**
   * Find sleep logs for a user within date range
   */
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Sleep[]>

  /**
   * Find most recent sleep log for a user
   */
  findMostRecentByUserId(userId: string): Promise<Sleep | null>

  /**
   * Save sleep log (create or update)
   */
  save(sleep: Sleep): Promise<Sleep>

  /**
   * Delete sleep log
   */
  delete(id: string): Promise<void>
}

