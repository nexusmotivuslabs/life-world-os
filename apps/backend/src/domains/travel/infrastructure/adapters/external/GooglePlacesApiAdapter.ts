/**
 * GooglePlacesApiAdapter
 * 
 * Infrastructure adapter implementing TravelApiPort using Google Places API.
 */

import { TravelApiPort, GooglePlace } from '../../../application/ports/TravelApiPort.js'
import { LocationCacheRepositoryPort } from '../../../application/ports/LocationCacheRepositoryPort.js'
import { logger } from '../lib/logger.js'

export class GooglePlacesApiAdapter implements TravelApiPort {
  private readonly apiKey: string | undefined
  private readonly baseUrl = 'https://places.googleapis.com/v1'
  private readonly cacheRepository: LocationCacheRepositoryPort

  constructor(
    apiKey: string | undefined,
    cacheRepository: LocationCacheRepositoryPort
  ) {
    this.apiKey = apiKey
    this.cacheRepository = cacheRepository
  }

  async searchPlaces(query: string, location?: string): Promise<GooglePlace[]> {
    if (!this.apiKey) {
      logger.warn('Google Places API key not configured - returning empty results')
      return []
    }

    try {
      const searchQuery = location ? `${query} in ${location}` : query

      const response = await fetch(`${this.baseUrl}/places:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.userRatingCount,places.location,places.types,places.editorialSummary,places.photos,places.nationalPhoneNumber,places.currentOpeningHours',
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          maxResultCount: 20,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Google Places API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      const places: GooglePlace[] = []

      if (data.places) {
        for (const place of data.places) {
          places.push(this.mapGooglePlaceResponse(place))
        }
      }

      return places
    } catch (error) {
      logger.error('Error searching Google Places:', error)
      throw error
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    if (!this.apiKey) {
      logger.warn('Google Places API key not configured - cannot fetch place details')
      return null
    }

    // Check cache first
    const cached = await this.cacheRepository.findByGooglePlaceId(placeId)
    if (cached && cached.expiresAt > new Date()) {
      return cached.data as GooglePlace
    }

    try {
      const response = await fetch(`${this.baseUrl}/places/${placeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,websiteUri,rating,userRatingCount,location,types,editorialSummary,photos,nationalPhoneNumber,currentOpeningHours',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const error = await response.text()
        throw new Error(`Google Places API error: ${response.status} - ${error}`)
      }

      const place = await response.json()
      const mappedPlace = this.mapGooglePlaceResponse(place)

      // Cache the result for 24 hours
      await this.cacheRepository.save({
        googlePlaceId: placeId,
        data: mappedPlace,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })

      return mappedPlace
    } catch (error) {
      logger.error('Error getting place details:', error)
      throw error
    }
  }

  async findSimilarPlaces(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    type?: string
  ): Promise<GooglePlace[]> {
    if (!this.apiKey) {
      logger.warn('Google Places API key not configured - returning empty results')
      return []
    }

    try {
      const requestBody: any = {
        includedTypes: type ? [type] : ['restaurant', 'food', 'point_of_interest', 'establishment'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },
            radius: radius,
          },
        },
      }

      const response = await fetch(`${this.baseUrl}/places:searchNearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.userRatingCount,places.location,places.types,places.editorialSummary,places.photos',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Google Places API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      const places: GooglePlace[] = []

      if (data.places) {
        for (const place of data.places) {
          places.push(this.mapGooglePlaceResponse(place))
        }
      }

      return places
    } catch (error) {
      logger.error('Error finding similar places:', error)
      throw error
    }
  }

  async getPlacePhotos(placeId: string, maxPhotos: number = 5): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured')
    }

    try {
      const place = await this.getPlaceDetails(placeId)
      if (!place || !place.photos) {
        return []
      }

      // Return photo references (frontend can construct URLs)
      return place.photos.slice(0, maxPhotos)
    } catch (error) {
      logger.error('Error getting place photos:', error)
      return []
    }
  }

  private mapGooglePlaceResponse(place: any): GooglePlace {
    return {
      placeId: place.id || place.place_id || '',
      name: place.displayName?.text || place.name || '',
      formattedAddress: place.formattedAddress || '',
      website: place.websiteUri || undefined,
      rating: place.rating || undefined,
      userRatingsTotal: place.userRatingCount || undefined,
      latitude: place.location?.latitude || undefined,
      longitude: place.location?.longitude || undefined,
      types: place.types || [],
      editorialSummary: place.editorialSummary?.text || undefined,
      photos: place.photos?.map((p: any) => p.name || p.photoReference) || [],
      phoneNumber: place.nationalPhoneNumber || undefined,
      openingHours: place.currentOpeningHours ? {
        openNow: place.currentOpeningHours.openNow,
        weekdayText: place.currentOpeningHours.weekdayDescriptions || [],
      } : undefined,
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false
    }

    try {
      // Try a simple search
      await this.searchPlaces('London', 'London')
      return true
    } catch (error) {
      logger.error('Google Places API connection test failed:', error)
      return false
    }
  }
}

