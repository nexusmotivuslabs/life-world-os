/**
 * SavedLocation Entity
 * 
 * Domain entity for user's saved locations.
 */

export class SavedLocation {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly locationId: string,
    public readonly notes: string | null,
    public readonly isFavorite: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    locationId: string,
    notes?: string | null,
    isFavorite: boolean = false
  ): SavedLocation {
    return new SavedLocation(
      id,
      userId,
      locationId,
      notes || null,
      isFavorite,
      new Date(),
      new Date()
    )
  }

  static fromPersistence(data: {
    id: string
    userId: string
    locationId: string
    notes: string | null
    isFavorite: boolean
    createdAt: Date
    updatedAt: Date
  }): SavedLocation {
    return new SavedLocation(
      data.id,
      data.userId,
      data.locationId,
      data.notes,
      data.isFavorite,
      data.createdAt,
      data.updatedAt
    )
  }

  markAsFavorite(): SavedLocation {
    return new SavedLocation(
      this.id,
      this.userId,
      this.locationId,
      this.notes,
      true,
      this.createdAt,
      new Date()
    )
  }

  unmarkAsFavorite(): SavedLocation {
    return new SavedLocation(
      this.id,
      this.userId,
      this.locationId,
      this.notes,
      false,
      this.createdAt,
      new Date()
    )
  }

  updateNotes(newNotes: string): SavedLocation {
    return new SavedLocation(
      this.id,
      this.userId,
      this.locationId,
      newNotes,
      this.isFavorite,
      this.createdAt,
      new Date()
    )
  }
}





