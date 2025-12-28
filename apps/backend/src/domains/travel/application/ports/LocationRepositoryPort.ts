/**
 * LocationRepositoryPort
 * 
 * Port (interface) for location repository operations.
 */

import { Location } from '../../domain/entities/Location.js'

export interface LocationRepositoryPort {
  /**
   * Find location by ID
   */
  findById(id: string): Promise<Location | null>

  /**
   * Find location by Google Place ID
   */
  findByGooglePlaceId(googlePlaceId: string): Promise<Location | null>

  /**
   * Find locations by city
   */
  findByCity(city: string): Promise<Location[]>

  /**
   * Find locations by country
   */
  findByCountry(country: string): Promise<Location[]>

  /**
   * Find locations by category
   */
  findByCategory(category: string): Promise<Location[]>

  /**
   * Search locations by query
   */
  search(query: string): Promise<Location[]>

  /**
   * Save location (create or update)
   */
  save(location: Location): Promise<Location>

  /**
   * Delete location
   */
  delete(id: string): Promise<void>
}


