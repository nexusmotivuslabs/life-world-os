/**
 * GetLocationDetailsUseCase
 * 
 * Use case for getting detailed location information.
 */

import { Location } from '../../domain/entities/Location.js'
import { LocationRepositoryPort } from '../ports/LocationRepositoryPort.js'
import { TravelApiPort } from '../ports/TravelApiPort.js'

export interface GetLocationDetailsInput {
  locationId: string
  refresh?: boolean // Force refresh from API
}

export class GetLocationDetailsUseCase {
  constructor(
    private locationRepository: LocationRepositoryPort,
    private travelApi: TravelApiPort
  ) {}

  async execute(input: GetLocationDetailsInput): Promise<Location> {
    let location = await this.locationRepository.findById(input.locationId)

    if (!location) {
      throw new Error('Location not found')
    }

    // Refresh from API if requested or cache expired
    if (input.refresh || location.isCacheExpired() || !location.googlePlaceId) {
      if (location.googlePlaceId) {
        const placeDetails = await this.travelApi.getPlaceDetails(location.googlePlaceId)
        if (placeDetails) {
          location = await this.updateLocationFromPlace(location, placeDetails)
        }
      }
    }

    return location
  }

  private async updateLocationFromPlace(
    existing: Location,
    place: import('../ports/TravelApiPort.js').GooglePlace
  ): Promise<Location> {
    const addressParts = place.formattedAddress.split(',')
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : null
    const country = addressParts.length > 0 ? addressParts[addressParts.length - 1].trim() : null

    const updated = Location.create(
      existing.id,
      place.name,
      city || undefined,
      country || undefined,
      place.editorialSummary || existing.description || undefined,
      place.website || existing.officialUrl || undefined,
      place.types?.[0] || existing.category || undefined,
      place.types || existing.tags,
      existing.metadata,
      place.placeId || existing.googlePlaceId || undefined,
      place.latitude || existing.latitude || undefined,
      place.longitude || existing.longitude || undefined,
      place.rating || existing.rating || undefined,
      place.userRatingsTotal || existing.userRatingsTotal || undefined,
      new Date()
    )

    return await this.locationRepository.save(updated)
  }
}


