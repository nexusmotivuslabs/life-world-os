/**
 * SavedLocationRepositoryPort
 * 
 * Port (interface) for saved location repository operations.
 */

import { SavedLocation } from '../../domain/entities/SavedLocation.js'

export interface SavedLocationRepositoryPort {
  /**
   * Find saved location by ID
   */
  findById(id: string): Promise<SavedLocation | null>

  /**
   * Find saved location by user and location ID
   */
  findByUserAndLocation(userId: string, locationId: string): Promise<SavedLocation | null>

  /**
   * Find all saved locations for a user
   */
  findByUserId(userId: string): Promise<SavedLocation[]>

  /**
   * Find favorite locations for a user
   */
  findFavorites(userId: string): Promise<SavedLocation[]>

  /**
   * Save location (create or update)
   */
  save(savedLocation: SavedLocation): Promise<SavedLocation>

  /**
   * Delete saved location
   */
  delete(id: string): Promise<void>
}





