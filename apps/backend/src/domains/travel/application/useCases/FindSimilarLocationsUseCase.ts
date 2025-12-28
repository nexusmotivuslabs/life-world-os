/**
 * FindSimilarLocationsUseCase
 * 
 * Use case for finding locations similar to a user's description.
 */

import { Location } from '../../domain/entities/Location.js'
import { LocationDescription } from '../../domain/valueObjects/LocationDescription.js'
import { LocationRepositoryPort } from '../ports/LocationRepositoryPort.js'
import { TravelApiPort } from '../ports/TravelApiPort.js'
import { LocationCacheRepositoryPort } from '../ports/LocationCacheRepositoryPort.js'
import { LocationQueryRepositoryPort } from '../ports/LocationQueryRepositoryPort.js'
import { LLMServicePort } from '../../../money/application/ports/LLMServicePort.js'
import { LocationMatchingService } from '../../domain/services/LocationMatchingService.js'
import { LocationRecommendationService, RecommendationCriteria } from '../../domain/services/LocationRecommendationService.js'

export interface FindSimilarLocationsInput {
  userId: string
  description: string
  location?: string // City/country context
  limit?: number
}

export interface FindSimilarLocationsOutput {
  locations: Location[]
  queryId: string
}

export class FindSimilarLocationsUseCase {
  constructor(
    private locationRepository: LocationRepositoryPort,
    private travelApi: TravelApiPort,
    private cacheRepository: LocationCacheRepositoryPort,
    private queryRepository: LocationQueryRepositoryPort,
    private llmService: LLMServicePort,
    private matchingService: LocationMatchingService,
    private recommendationService: LocationRecommendationService
  ) {}

  async execute(input: FindSimilarLocationsInput): Promise<FindSimilarLocationsOutput> {
    // Validate and create description value object
    const description = LocationDescription.create(input.description)

    // Use LLM to extract keywords and location context
    const extractedInfo = await this.extractLocationInfo(description.value, input.location)

    // Search using travel API (Google Places or LLM)
    const searchQuery = this.buildSearchQuery(extractedInfo)
    console.log('Searching for locations with query:', searchQuery, 'in location:', input.location)
    const googlePlaces = await this.travelApi.searchPlaces(searchQuery, input.location)
    console.log('Found', googlePlaces.length, 'places from API')

    // Convert places to domain entities
    const locations: Location[] = []
    console.log('🔄 Converting', googlePlaces.length, 'places to domain entities...')
    
    for (const place of googlePlaces.slice(0, input.limit || 15)) {
      // For LLM-generated places, create directly (they already have all data)
      // For Google Places, check cache first, then get details if needed
      let location: Location | null = null
      
      if (place.placeId.startsWith('llm-place-')) {
        // LLM place - create directly with all data already provided
        location = await this.createOrUpdateLocation(place)
      } else {
        // Google Places - check cache first
        location = await this.locationRepository.findByGooglePlaceId(place.placeId)
        
        if (!location || location.isCacheExpired()) {
          // Get full details from Google Places
          const details = await this.travelApi.getPlaceDetails(place.placeId)
          if (details) {
            location = await this.createOrUpdateLocation(details)
          }
        }
      }

      if (location) {
        locations.push(location)
        console.log('✅ Added location:', location.name, 'Website:', location.officialUrl ? 'Yes ✓' : 'No ✗')
      }
    }
    
    console.log('📊 Total locations created:', locations.length)
    const withWebsites = locations.filter(loc => loc.officialUrl).length
    console.log('🌐 Locations with websites:', withWebsites, 'out of', locations.length)

    // Match locations to user description
    const matchedResults = this.matchingService.matchLocations(description, locations)
    const recommendedLocations = matchedResults
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, input.limit || 10)
      .map(result => result.location)

    // Save query
    const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const { LocationQuery } = await import('../../domain/entities/LocationQuery.js')
    const query = LocationQuery.create(
      queryId,
      input.userId,
      input.description,
      input.location || null,
      recommendedLocations.map(loc => ({
        locationId: loc.id,
        name: loc.name,
        description: loc.description || undefined,
        relevanceScore: matchedResults.find(m => m.location.id === loc.id)?.matchScore || 0
      })),
      null
    )
    const savedQuery = await this.queryRepository.save(query)

    return {
      locations: recommendedLocations,
      queryId: savedQuery.id
    }
  }

  private async extractLocationInfo(description: string, location?: string): Promise<{
    keywords: string[]
    city?: string
    category?: string
  }> {
    try {
      const prompt = `Extract key information from this location description:
"${description}"

${location ? `Context: ${location}` : ''}

Return a JSON object with:
- keywords: array of important keywords (max 10)
- city: city name if mentioned
- category: category like "market", "restaurant", "attraction", etc.

Only return valid JSON, no other text.`

      const response = await this.llmService.generateResponse([
        { role: 'user', content: prompt }
      ], { temperature: 0.3, maxTokens: 200 })

      const parsed = JSON.parse(response.content)
      return {
        keywords: parsed.keywords || [],
        city: parsed.city || location,
        category: parsed.category
      }
    } catch (error) {
      // Fallback to simple extraction
      const desc = LocationDescription.create(description)
      return {
        keywords: desc.extractKeywords(),
        city: location
      }
    }
  }

  private buildSearchQuery(extractedInfo: { keywords: string[]; city?: string; category?: string }): string {
    const parts: string[] = []
    if (extractedInfo.category) parts.push(extractedInfo.category)
    if (extractedInfo.keywords.length > 0) parts.push(...extractedInfo.keywords.slice(0, 3))
    if (extractedInfo.city) parts.push(extractedInfo.city)
    return parts.join(' ')
  }

  private async createOrUpdateLocation(place: import('../ports/TravelApiPort.js').GooglePlace): Promise<Location> {
    const locationId = `location-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Parse address to extract city/country
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

