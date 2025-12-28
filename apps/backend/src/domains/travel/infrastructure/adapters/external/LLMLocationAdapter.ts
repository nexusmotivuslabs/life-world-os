/**
 * LLMLocationAdapter
 * 
 * Adapter that uses LLM to generate location recommendations instead of Google Places API.
 * This is a cost-effective alternative that uses Groq or other LLMs.
 */

import { TravelApiPort, GooglePlace } from '../../../application/ports/TravelApiPort.js'
import { LLMServicePort } from '../../../money/application/ports/LLMServicePort.js'
import { logger } from '../lib/logger.js'

export class LLMLocationAdapter implements TravelApiPort {
  constructor(private llmService: LLMServicePort) {}

  async searchPlaces(query: string, location?: string): Promise<GooglePlace[]> {
    const prompt = `You are a travel expert. Based on this query: "${query}"${location ? ` in ${location}` : ''}, generate a list of 10-15 real, well-known locations that match this description.

CRITICAL: You MUST include official website URLs for each location. Research and provide actual websites.

Return a JSON array of locations with this exact structure:
[
  {
    "name": "Location Name",
    "formattedAddress": "Full address, City, Country",
    "website": "https://official-website.com",
    "rating": 4.5,
    "userRatingsTotal": 1234,
    "types": ["restaurant", "food", "point_of_interest"],
    "editorialSummary": "Detailed description explaining why this location matches the query and what makes it better or similar",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "category": "market",
    "highlights": ["feature 1", "feature 2", "feature 3"]
  }
]

Requirements:
- Only return real, existing locations that you know exist
- ALWAYS include official website URLs - this is mandatory
- Provide realistic ratings (3.5-5.0)
- Include realistic review counts (100-10000)
- Use actual coordinates for the location
- Make editorialSummary detailed and specific (2-3 sentences)
- Include category (market, restaurant, attraction, etc.)
- Include highlights array with 3-5 key features
- Return valid JSON only, no markdown or code blocks
- Ensure all locations have websites - if you don't know the website, research it or skip that location`

    try {
      logger.info('🤖 Calling LLM to generate locations for query:', query)
      const response = await this.llmService.generateResponse(
        [
          {
            role: 'system',
            content: 'You are a travel expert. Always return valid JSON arrays with location data. Every location MUST have a website URL.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          temperature: 0.7,
          maxTokens: 4000, // Increased for more detailed responses
        }
      )
      logger.info('🤖 LLM response received, length:', response.content.length)

      // Parse JSON response
      let content = response.content.trim()
      // Remove markdown code blocks if present
      if (content.startsWith('```')) {
        content = content.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '')
      }

      let locations
      try {
        locations = JSON.parse(content)
      } catch (parseError) {
        // Try to extract JSON from text if wrapped
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          locations = JSON.parse(jsonMatch[0])
        } else {
          logger.error('Failed to parse LLM response as JSON:', content.substring(0, 200))
          return []
        }
      }

      // Ensure it's an array
      if (!Array.isArray(locations)) {
        locations = [locations]
      }

      // Filter out locations without websites (as per requirements)
      const validLocations = locations.filter((loc: any) => {
        const hasWebsite = loc.website && (loc.website.startsWith('http://') || loc.website.startsWith('https://'))
        if (!hasWebsite) {
          logger.warn(`⚠️ Location "${loc.name}" skipped - no valid website URL provided. Website value:`, loc.website)
        }
        return hasWebsite
      })
      
      logger.info(`✅ Filtered ${validLocations.length} locations with websites from ${locations.length} total`)

      // Map to GooglePlace format with enhanced data
      return validLocations.map((loc: any, index: number) => ({
        placeId: `llm-place-${Date.now()}-${index}`,
        name: loc.name || 'Unknown Location',
        formattedAddress: loc.formattedAddress || loc.address || '',
        website: loc.website, // Required - already filtered
        rating: loc.rating || 4.0,
        userRatingsTotal: loc.userRatingsTotal || loc.reviewCount || 100,
        latitude: loc.latitude || undefined,
        longitude: loc.longitude || undefined,
        types: loc.types || [loc.category || 'point_of_interest'],
        editorialSummary: loc.editorialSummary || loc.description || '',
        photos: [],
        phoneNumber: loc.phoneNumber || undefined,
        openingHours: undefined,
        // Additional fields for hierarchical display
        category: loc.category || loc.types?.[0] || 'point_of_interest',
        highlights: loc.highlights || [],
      }))
    } catch (error) {
      logger.error('Error generating locations with LLM:', error)
      // Return empty array on error
      return []
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    // For LLM-generated places, we don't have additional details
    // Return null to indicate details not available
    return null
  }

  async findSimilarPlaces(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    type?: string
  ): Promise<GooglePlace[]> {
    // Use LLM to generate similar places based on location and type
    const locationQuery = `Find ${type || 'places'} near coordinates ${latitude}, ${longitude} within ${radius}m radius`
    return this.searchPlaces(locationQuery)
  }

  async getPlacePhotos(placeId: string, maxPhotos: number = 5): Promise<string[]> {
    // LLM doesn't provide photos
    return []
  }
}

