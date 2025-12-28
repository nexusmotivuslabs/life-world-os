/**
 * LocationQuery Entity
 * 
 * Domain entity for tracking user location queries.
 */

export interface LocationQueryResult {
  locationId: string
  name: string
  description?: string
  relevanceScore?: number
  [key: string]: any
}

export class LocationQuery {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly queryText: string,
    public readonly location: string | null,
    public readonly results: LocationQueryResult[] | null,
    public readonly locationId: string | null,
    public readonly createdAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    queryText: string,
    location?: string | null,
    results?: LocationQueryResult[] | null,
    locationId?: string | null
  ): LocationQuery {
    return new LocationQuery(
      id,
      userId,
      queryText,
      location || null,
      results || null,
      locationId || null,
      new Date()
    )
  }

  static fromPersistence(data: {
    id: string
    userId: string
    queryText: string
    location: string | null
    results: unknown
    locationId: string | null
    createdAt: Date
  }): LocationQuery {
    return new LocationQuery(
      data.id,
      data.userId,
      data.queryText,
      data.location,
      data.results as LocationQueryResult[] | null,
      data.locationId,
      data.createdAt
    )
  }

  updateResults(results: LocationQueryResult[]): LocationQuery {
    return new LocationQuery(
      this.id,
      this.userId,
      this.queryText,
      this.location,
      results,
      this.locationId,
      this.createdAt
    )
  }
}


