/**
 * LocationRecommendationService
 * 
 * Domain service for location recommendation business logic.
 */

import { Location } from '../entities/Location.js'

export interface RecommendationCriteria {
  keywords?: string[]
  city?: string
  country?: string
  category?: string
  minRating?: number
  maxDistance?: number // in kilometers
  latitude?: number
  longitude?: number
}

export interface LocationRecommendation {
  location: Location
  relevanceScore: number
  reasons: string[]
}

export class LocationRecommendationService {
  /**
   * Calculate relevance score for a location based on criteria
   */
  calculateRelevanceScore(
    location: Location,
    criteria: RecommendationCriteria
  ): number {
    let score = 0
    const reasons: string[] = []

    // Keyword matching in name and description
    if (criteria.keywords && criteria.keywords.length > 0) {
      const locationText = `${location.name} ${location.description || ''}`.toLowerCase()
      const matchedKeywords = criteria.keywords.filter(keyword =>
        locationText.includes(keyword.toLowerCase())
      )
      const keywordScore = (matchedKeywords.length / criteria.keywords.length) * 40
      score += keywordScore
      if (matchedKeywords.length > 0) {
        reasons.push(`Matches ${matchedKeywords.length} keyword(s)`)
      }
    }

    // Location matching
    if (criteria.city && location.city?.toLowerCase() === criteria.city.toLowerCase()) {
      score += 20
      reasons.push('Matches city')
    }
    if (criteria.country && location.country?.toLowerCase() === criteria.country.toLowerCase()) {
      score += 15
      reasons.push('Matches country')
    }

    // Category matching
    if (criteria.category && location.category?.toLowerCase() === criteria.category.toLowerCase()) {
      score += 15
      reasons.push('Matches category')
    }

    // Rating boost
    if (criteria.minRating && location.rating && location.rating >= criteria.minRating) {
      score += 10
      reasons.push(`High rating: ${location.rating}`)
    }

    // Distance calculation (if coordinates available)
    if (criteria.latitude && criteria.longitude && location.hasValidCoordinates()) {
      const distance = this.calculateDistance(
        criteria.latitude,
        criteria.longitude,
        location.latitude!,
        location.longitude!
      )
      if (criteria.maxDistance && distance <= criteria.maxDistance) {
        const distanceScore = Math.max(0, 10 * (1 - distance / criteria.maxDistance))
        score += distanceScore
        reasons.push(`Within ${distance.toFixed(1)}km`)
      }
    }

    return Math.min(100, score)
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Generate recommendations from a list of locations
   */
  generateRecommendations(
    locations: Location[],
    criteria: RecommendationCriteria,
    limit: number = 10
  ): LocationRecommendation[] {
    const recommendations = locations
      .map(location => {
        const relevanceScore = this.calculateRelevanceScore(location, criteria)
        const reasons: string[] = []
        
        // Collect reasons
        if (criteria.keywords && criteria.keywords.length > 0) {
          const locationText = `${location.name} ${location.description || ''}`.toLowerCase()
          const matchedKeywords = criteria.keywords.filter(keyword =>
            locationText.includes(keyword.toLowerCase())
          )
          if (matchedKeywords.length > 0) {
            reasons.push(`Matches ${matchedKeywords.length} keyword(s)`)
          }
        }
        if (criteria.city && location.city?.toLowerCase() === criteria.city.toLowerCase()) {
          reasons.push('Matches city')
        }
        if (location.rating && location.rating >= 4.0) {
          reasons.push(`Highly rated: ${location.rating}`)
        }

        return {
          location,
          relevanceScore,
          reasons: reasons.length > 0 ? reasons : ['Relevant location']
        }
      })
      .filter(rec => rec.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    return recommendations
  }
}


