/**
 * TravelApiPort
 * 
 * Port (interface) for external travel API operations (Google Places).
 */

export interface GooglePlace {
  placeId: string
  name: string
  formattedAddress: string
  website?: string
  rating?: number
  userRatingsTotal?: number
  latitude?: number
  longitude?: number
  types?: string[]
  editorialSummary?: string
  photos?: string[]
  phoneNumber?: string
  openingHours?: {
    openNow?: boolean
    weekdayText?: string[]
  }
}

export interface TravelApiPort {
  /**
   * Search places by text query
   */
  searchPlaces(query: string, location?: string): Promise<GooglePlace[]>

  /**
   * Get place details by place ID
   */
  getPlaceDetails(placeId: string): Promise<GooglePlace | null>

  /**
   * Find similar places near a location
   */
  findSimilarPlaces(
    latitude: number,
    longitude: number,
    radius?: number,
    type?: string
  ): Promise<GooglePlace[]>

  /**
   * Get place photos
   */
  getPlacePhotos(placeId: string, maxPhotos?: number): Promise<string[]>
}


