/**
 * LocationCacheRepositoryPort
 * 
 * Port (interface) for location cache repository operations.
 */

export interface CachedLocationData {
  googlePlaceId: string
  data: any
  expiresAt: Date
}

export interface LocationCacheRepositoryPort {
  /**
   * Find cached data by Google Place ID
   */
  findByGooglePlaceId(googlePlaceId: string): Promise<CachedLocationData | null>

  /**
   * Save cached data
   */
  save(data: CachedLocationData): Promise<CachedLocationData>

  /**
   * Delete expired cache entries
   */
  deleteExpired(): Promise<number>

  /**
   * Delete cache entry by Google Place ID
   */
  delete(googlePlaceId: string): Promise<void>
}


