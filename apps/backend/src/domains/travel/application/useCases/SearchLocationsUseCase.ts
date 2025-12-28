/**
 * SearchLocationsUseCase
 * 
 * Use case for searching locations by query.
 */

import { Location } from '../../domain/entities/Location.js'
import { LocationRepositoryPort } from '../ports/LocationRepositoryPort.js'
import { TravelApiPort } from '../ports/TravelApiPort.js'

export interface SearchLocationsInput {
  query: string
  location?: string // City/country context
  limit?: number
}

export class SearchLocationsUseCase {
  constructor(
    private locationRepository: LocationRepositoryPort,
    private travelApi: TravelApiPort
  ) {}

  async execute(input: SearchLocationsInput): Promise<Location[]> {
    // Search Google Places API
    const googlePlaces = await this.travelApi.searchPlaces(input.query, input.location)

    // Convert to domain entities
    const locations: Location[] = []
    for (const place of googlePlaces.slice(0, input.limit || 20)) {
      let location = await this.locationRepository.findByGooglePlaceId(place.placeId)

      if (!location || location.isCacheExpired()) {
        // Get full details
        const details = await this.travelApi.getPlaceDetails(place.placeId)
        if (details) {
          location = await this.createLocationFromPlace(details)
        }
      }

      if (location) {
        locations.push(location)
      }
    }

    return locations
  }

  private async createLocationFromPlace(place: import('../ports/TravelApiPort.js').GooglePlace): Promise<Location> {
    const locationId = `location-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const addressParts = place.formattedAddress.split(',')
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : null
    const country = addressParts.length > 0 ? addressParts[addressParts.length - 1].trim() : null

    const location = Location.create(
      locationId,
      place.name,
      city || undefined,
      country || undefined,
      place.editorialSummary || undefined,
      place.website,
      place.types?.[0],
      place.types || [],
      null,
      place.placeId,
      place.latitude,
      place.longitude,
      place.rating,
      place.userRatingsTotal,
      new Date()
    )

    return await this.locationRepository.save(location)
  }
}


