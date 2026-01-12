/**
 * Location Entity
 * 
 * Domain entity for travel locations with business logic.
 */

export interface LocationMetadata {
  [key: string]: any // Flexible structure for additional location data
}

export class Location {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly city: string | null,
    public readonly country: string | null,
    public readonly description: string | null,
    public readonly officialUrl: string | null,
    public readonly category: string | null,
    public readonly tags: string[],
    public readonly metadata: LocationMetadata | null,
    public readonly googlePlaceId: string | null,
    public readonly latitude: number | null,
    public readonly longitude: number | null,
    public readonly rating: number | null,
    public readonly userRatingsTotal: number | null,
    public readonly cachedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    name: string,
    city?: string | null,
    country?: string | null,
    description?: string | null,
    officialUrl?: string | null,
    category?: string | null,
    tags?: string[],
    metadata?: LocationMetadata | null,
    googlePlaceId?: string | null,
    latitude?: number | null,
    longitude?: number | null,
    rating?: number | null,
    userRatingsTotal?: number | null,
    cachedAt?: Date | null
  ): Location {
    return new Location(
      id,
      name,
      city || null,
      country || null,
      description || null,
      officialUrl || null,
      category || null,
      tags || [],
      metadata || null,
      googlePlaceId || null,
      latitude || null,
      longitude || null,
      rating || null,
      userRatingsTotal || null,
      cachedAt || null,
      new Date(),
      new Date()
    )
  }

  static fromPersistence(data: {
    id: string
    name: string
    city: string | null
    country: string | null
    description: string | null
    officialUrl: string | null
    category: string | null
    tags: string[]
    metadata: unknown
    googlePlaceId: string | null
    latitude: number | null
    longitude: number | null
    rating: number | null
    userRatingsTotal: number | null
    cachedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }): Location {
    return new Location(
      data.id,
      data.name,
      data.city,
      data.country,
      data.description,
      data.officialUrl,
      data.category,
      data.tags,
      data.metadata as LocationMetadata | null,
      data.googlePlaceId,
      data.latitude,
      data.longitude,
      data.rating,
      data.userRatingsTotal,
      data.cachedAt,
      data.createdAt,
      data.updatedAt
    )
  }

  updateDescription(newDescription: string): Location {
    return new Location(
      this.id,
      this.name,
      this.city,
      this.country,
      newDescription,
      this.officialUrl,
      this.category,
      this.tags,
      this.metadata,
      this.googlePlaceId,
      this.latitude,
      this.longitude,
      this.rating,
      this.userRatingsTotal,
      this.cachedAt,
      this.createdAt,
      new Date()
    )
  }

  updateRating(rating: number, userRatingsTotal: number): Location {
    return new Location(
      this.id,
      this.name,
      this.city,
      this.country,
      this.description,
      this.officialUrl,
      this.category,
      this.tags,
      this.metadata,
      this.googlePlaceId,
      this.latitude,
      this.longitude,
      rating,
      userRatingsTotal,
      this.cachedAt,
      this.createdAt,
      new Date()
    )
  }

  markAsCached(): Location {
    return new Location(
      this.id,
      this.name,
      this.city,
      this.country,
      this.description,
      this.officialUrl,
      this.category,
      this.tags,
      this.metadata,
      this.googlePlaceId,
      this.latitude,
      this.longitude,
      this.rating,
      this.userRatingsTotal,
      new Date(),
      this.createdAt,
      new Date()
    )
  }

  hasValidCoordinates(): boolean {
    return this.latitude !== null && this.longitude !== null
  }

  isCacheExpired(ttlHours: number = 24): boolean {
    if (!this.cachedAt) return true
    const now = new Date()
    const cacheAge = now.getTime() - this.cachedAt.getTime()
    const ttlMs = ttlHours * 60 * 60 * 1000
    return cacheAge > ttlMs
  }
}





