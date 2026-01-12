/**
 * LocationQueryRepositoryPort
 * 
 * Port (interface) for location query repository operations.
 */

import { LocationQuery } from '../../domain/entities/LocationQuery.js'

export interface LocationQueryRepositoryPort {
  /**
   * Find query by ID
   */
  findById(id: string): Promise<LocationQuery | null>

  /**
   * Find queries by user ID
   */
  findByUserId(userId: string): Promise<LocationQuery[]>

  /**
   * Save query (create or update)
   */
  save(query: LocationQuery): Promise<LocationQuery>

  /**
   * Delete query
   */
  delete(id: string): Promise<void>
}





