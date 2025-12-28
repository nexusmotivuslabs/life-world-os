/**
 * LocationMatchingService
 * 
 * Domain service for matching user descriptions to locations.
 */

import { Location } from '../entities/Location.js'
import { LocationDescription } from '../valueObjects/LocationDescription.js'

export interface MatchResult {
  location: Location
  matchScore: number
  matchedFeatures: string[]
}

export class LocationMatchingService {
  /**
   * Match locations based on user description
   */
  matchLocations(
    description: LocationDescription,
    locations: Location[]
  ): MatchResult[] {
    const keywords = description.extractKeywords()
    
    return locations
      .map(location => {
        const matchResult = this.calculateMatch(location, keywords, description.value)
        return {
          location,
          matchScore: matchResult.score,
          matchedFeatures: matchResult.features
        }
      })
      .filter(result => result.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  private calculateMatch(
    location: Location,
    keywords: string[],
    description: string
  ): { score: number; features: string[] } {
    let score = 0
    const features: string[] = []
    const locationText = `${location.name} ${location.description || ''} ${location.category || ''}`.toLowerCase()
    const descriptionLower = description.toLowerCase()

    // Keyword matching
    const matchedKeywords = keywords.filter(keyword =>
      locationText.includes(keyword.toLowerCase())
    )
    if (matchedKeywords.length > 0) {
      score += (matchedKeywords.length / keywords.length) * 50
      features.push(`Matches keywords: ${matchedKeywords.join(', ')}`)
    }

    // Category matching
    if (location.category) {
      const categoryKeywords = ['market', 'restaurant', 'bar', 'cafe', 'attraction', 'park', 'museum']
      const matchedCategory = categoryKeywords.find(cat =>
        descriptionLower.includes(cat) && locationText.includes(cat)
      )
      if (matchedCategory) {
        score += 20
        features.push(`Category match: ${matchedCategory}`)
      }
    }

    // Rating boost for highly rated places
    if (location.rating && location.rating >= 4.0) {
      score += 15
      features.push(`Highly rated: ${location.rating}`)
    }

    // Description similarity (simple word overlap)
    const descriptionWords = new Set(descriptionLower.split(/\s+/).filter(w => w.length > 3))
    const locationWords = new Set(locationText.split(/\s+/).filter(w => w.length > 3))
    const commonWords = [...descriptionWords].filter(w => locationWords.has(w))
    if (commonWords.length > 0) {
      score += Math.min(15, commonWords.length * 3)
      features.push(`Description similarity: ${commonWords.length} common words`)
    }

    return { score: Math.min(100, score), features }
  }

  /**
   * Find best matching location
   */
  findBestMatch(
    description: LocationDescription,
    locations: Location[]
  ): MatchResult | null {
    const matches = this.matchLocations(description, locations)
    return matches.length > 0 ? matches[0] : null
  }
}


