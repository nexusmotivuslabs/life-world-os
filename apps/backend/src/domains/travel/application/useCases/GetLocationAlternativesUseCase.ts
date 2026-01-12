/**
 * GetLocationAlternativesUseCase
 * 
 * Use case for getting alternative locations similar to a given location.
 */

import { Location } from '../../domain/entities/Location.js'
import { LocationRepositoryPort } from '../ports/LocationRepositoryPort.js'
import { TravelApiPort } from '../ports/TravelApiPort.js'
import { LocationRecommendationService, RecommendationCriteria } from '../../domain/services/LocationRecommendationService.js'

export interface GetLocationAlternativesInput {
  locationId: string
  radius?: number // in kilometers
  limit?: number
}

export class GetLocationAlternativesUseCase {
  constructor(
    private locationRepository: LocationRepositoryPort,
    private travelApi: TravelApiPort,
    private recommendationService: LocationRecommendationService
  ) {}

  async execute(input: GetLocationAlternativesInput): Promise<Location[]> {
    // Get the reference location
    const referenceLocation = await this.locationRepository.findById(input.locationId)
    if (!referenceLocation) {
      throw new Error('Location not found')
    }

    if (!referenceLocation.hasValidCoordinates()) {
      throw new Error('Location does not have valid coordinates')
    }

    // Find similar places using Google Places API
    const similarPlaces = await this.travelApi.findSimilarPlaces(
      referenceLocation.latitude!,
      referenceLocation.longitude!,
      input.radius || 5000, // Default 5km radius
      referenceLocation.category || undefined
    )

    // Convert to domain entities and get from cache or create
    const alternatives: Location[] = []
    for (const place of similarPlaces.slice(0, input.limit || 10)) {
      // Skip the reference location itself
      if (place.placeId === referenceLocation.googlePlaceId) {
        continue
      }

      let location = await this.locationRepository.findByGooglePlaceId(place.placeId)

      if (!location || location.isCacheExpired()) {
        // Get full details
        const details = await this.travelApi.getPlaceDetails(place.placeId)
        if (details) {
          location = await this.createLocationFromPlace(details)
        }
      }

      if (location) {
        alternatives.push(location)
      }
    }

    // Use recommendation service to rank alternatives
    const criteria: RecommendationCriteria = {
      category: referenceLocation.category || undefined,
      city: referenceLocation.city || undefined,
      country: referenceLocation.country || undefined,
      latitude: referenceLocation.latitude || undefined,
      longitude: referenceLocation.longitude || undefined,
      maxDistance: input.radius || 5000,
      minRating: referenceLocation.rating || undefined
    }

    const recommendations = this.recommendationService.generateRecommendations(
      alternatives,
      criteria,
      input.limit || 10
    )

    return recommendations.map(rec => rec.location)
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





