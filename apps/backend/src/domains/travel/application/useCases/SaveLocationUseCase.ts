/**
 * SaveLocationUseCase
 * 
 * Use case for saving a location to user's list.
 */

import { SavedLocation } from '../../domain/entities/SavedLocation.js'
import { SavedLocationRepositoryPort } from '../ports/SavedLocationRepositoryPort.js'

export interface SaveLocationInput {
  userId: string
  locationId: string
  notes?: string
  isFavorite?: boolean
}

export class SaveLocationUseCase {
  constructor(
    private savedLocationRepository: SavedLocationRepositoryPort
  ) {}

  async execute(input: SaveLocationInput): Promise<SavedLocation> {
    // Check if already saved
    const existing = await this.savedLocationRepository.findByUserAndLocation(
      input.userId,
      input.locationId
    )

    if (existing) {
      // Update existing
      let updated = existing
      if (input.notes !== undefined) {
        updated = updated.updateNotes(input.notes)
      }
      if (input.isFavorite !== undefined) {
        updated = input.isFavorite ? updated.markAsFavorite() : updated.unmarkAsFavorite()
      }
      return await this.savedLocationRepository.save(updated)
    }

    // Create new
    const id = `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const savedLocation = SavedLocation.create(
      id,
      input.userId,
      input.locationId,
      input.notes,
      input.isFavorite || false
    )

    return await this.savedLocationRepository.save(savedLocation)
  }
}


