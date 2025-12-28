/**
 * LocationController
 * 
 * Presentation layer controller for travel location endpoints.
 */

import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { prisma } from '../../../../lib/prisma.js'
import { PrismaLocationRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaLocationRepositoryAdapter.js'
import { PrismaLocationQueryRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaLocationQueryRepositoryAdapter.js'
import { PrismaSavedLocationRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaSavedLocationRepositoryAdapter.js'
import { PrismaLocationCacheRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaLocationCacheRepositoryAdapter.js'
import { GooglePlacesApiAdapter } from '../../infrastructure/adapters/external/GooglePlacesApiAdapter.js'
import { LLMLocationAdapter } from '../../infrastructure/adapters/external/LLMLocationAdapter.js'
import { GroqLMAdapter } from '../../infrastructure/adapters/llm/GroqLMAdapter.js'
import { FindSimilarLocationsUseCase } from '../../application/useCases/FindSimilarLocationsUseCase.js'
import { SaveLocationUseCase } from '../../application/useCases/SaveLocationUseCase.js'
import { GetLocationAlternativesUseCase } from '../../application/useCases/GetLocationAlternativesUseCase.js'
import { SearchLocationsUseCase } from '../../application/useCases/SearchLocationsUseCase.js'
import { GetLocationDetailsUseCase } from '../../application/useCases/GetLocationDetailsUseCase.js'
import { LocationMatchingService } from '../../domain/services/LocationMatchingService.js'
import { LocationRecommendationService } from '../../domain/services/LocationRecommendationService.js'
import { OpenAILMAdapter } from '../../../money/infrastructure/adapters/llm/OpenAILMAdapter.js'

const router = Router()

// Initialize adapters
const locationRepository = new PrismaLocationRepositoryAdapter(prisma)
const queryRepository = new PrismaLocationQueryRepositoryAdapter(prisma)
const savedLocationRepository = new PrismaSavedLocationRepositoryAdapter(prisma)
const cacheRepository = new PrismaLocationCacheRepositoryAdapter(prisma)

// Initialize LLM service - prefer Groq (cheap and fast), fallback to OpenAI
let llmService: any
try {
  if (process.env.GROQ_API_KEY) {
    llmService = new GroqLMAdapter(process.env.GROQ_API_KEY)
    console.log('✅ Using Groq LLM for location recommendations')
  } else if (process.env.OPENAI_API_KEY) {
    llmService = new OpenAILMAdapter(process.env.OPENAI_API_KEY)
    console.log('✅ Using OpenAI LLM for location recommendations')
  } else {
    // Create a mock LLM service that just returns empty keywords
    llmService = {
      generateResponse: async () => ({ content: '{}' })
    }
    console.log('⚠️ No LLM API key configured - location recommendations will be limited')
  }
} catch (error) {
  console.error('Error initializing LLM service:', error)
  // Fallback mock service
  llmService = {
    generateResponse: async () => ({ content: '{}' })
  }
}

// Initialize travel API - use LLM if Google Places not configured, otherwise use Google Places
let travelApi: any
const useLLMForLocations = process.env.USE_LLM_FOR_LOCATIONS === 'true' || !process.env.GOOGLE_PLACES_API_KEY

if (useLLMForLocations && llmService && llmService.generateResponse) {
  travelApi = new LLMLocationAdapter(llmService)
  console.log('✅ Using LLM-based location generation (cost-effective)')
} else {
  travelApi = new GooglePlacesApiAdapter(
    process.env.GOOGLE_PLACES_API_KEY,
    cacheRepository
  )
  console.log('✅ Using Google Places API for location data')
}

const matchingService = new LocationMatchingService()
const recommendationService = new LocationRecommendationService()

// Initialize use cases
const findSimilarLocationsUseCase = new FindSimilarLocationsUseCase(
  locationRepository,
  travelApi,
  cacheRepository,
  queryRepository,
  llmService,
  matchingService,
  recommendationService
)
const saveLocationUseCase = new SaveLocationUseCase(savedLocationRepository)
const getLocationAlternativesUseCase = new GetLocationAlternativesUseCase(
  locationRepository,
  travelApi,
  recommendationService
)
const searchLocationsUseCase = new SearchLocationsUseCase(locationRepository, travelApi)
const getLocationDetailsUseCase = new GetLocationDetailsUseCase(locationRepository, travelApi)

/**
 * GET /api/travel/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const useLLM = process.env.USE_LLM_FOR_LOCATIONS === 'true' || !process.env.GOOGLE_PLACES_API_KEY
    const hasGroq = !!process.env.GROQ_API_KEY
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasGooglePlaces = !!process.env.GOOGLE_PLACES_API_KEY

    let apiStatus = 'not-configured'
    if (useLLM) {
      if (hasGroq) {
        apiStatus = 'using-groq-llm'
      } else if (hasOpenAI) {
        apiStatus = 'using-openai-llm'
      } else {
        apiStatus = 'llm-not-configured'
      }
    } else if (hasGooglePlaces) {
      try {
        const isConnected = await travelApi.testConnection?.()
        apiStatus = isConnected ? 'using-google-places' : 'google-places-unavailable'
      } catch (error) {
        apiStatus = 'google-places-unavailable'
      }
    }

    res.json({
      status: 'ok',
      locationService: apiStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Health check failed' })
  }
})

/**
 * POST /api/travel/locations/query
 * Query for similar locations based on description
 */
router.post('/locations/query', async (req: Request, res: Response) => {
  try {
    console.log('📍 Location query received:', { description: req.body.description, location: req.body.location })
    const userId = req.body.userId || 'demo-user-id' // TODO: Extract from auth token
    const { description, location, limit } = req.body

    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }

    console.log('🔍 Executing FindSimilarLocationsUseCase...')
    const result = await findSimilarLocationsUseCase.execute({
      userId,
      description,
      location,
      limit,
    })
    console.log('✅ Use case completed. Found', result.locations.length, 'locations')

    // Group locations by category for hierarchical display
    const locationsByCategory: Record<string, typeof result.locations> = {}
    result.locations.forEach(loc => {
      const category = loc.category || 'other'
      if (!locationsByCategory[category]) {
        locationsByCategory[category] = []
      }
      locationsByCategory[category].push(loc)
    })

    // Sort locations within each category by rating (highest first)
    Object.keys(locationsByCategory).forEach(category => {
      locationsByCategory[category].sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        return ratingB - ratingA
      })
    })

    res.json({
      locations: result.locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        country: loc.country,
        description: loc.description,
        officialUrl: loc.officialUrl,
        category: loc.category,
        tags: loc.tags,
        rating: loc.rating,
        userRatingsTotal: loc.userRatingsTotal,
        latitude: loc.latitude,
        longitude: loc.longitude,
      })),
      // Hierarchical structure grouped by category
      hierarchy: Object.keys(locationsByCategory).map(category => ({
        category,
        count: locationsByCategory[category].length,
        locations: locationsByCategory[category].map(loc => ({
          id: loc.id,
          name: loc.name,
          city: loc.city,
          country: loc.country,
          description: loc.description,
          officialUrl: loc.officialUrl,
          category: loc.category,
          tags: loc.tags,
          rating: loc.rating,
          userRatingsTotal: loc.userRatingsTotal,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })),
      })),
      queryId: result.queryId,
      summary: {
        total: result.locations.length,
        categories: Object.keys(locationsByCategory),
        withWebsites: result.locations.filter(loc => loc.officialUrl).length,
        averageRating: result.locations.length > 0
          ? result.locations.reduce((sum, loc) => sum + (loc.rating || 0), 0) / result.locations.length
          : 0,
      },
    })
  } catch (error: any) {
    console.error('Error querying locations:', error)
    res.status(500).json({ error: error.message || 'Failed to query locations' })
  }
})

/**
 * GET /api/travel/locations
 * List locations
 */
router.get('/locations', async (req: Request, res: Response) => {
  try {
    const city = req.query.city as string | undefined
    const country = req.query.country as string | undefined
    const category = req.query.category as string | undefined

    let locations
    if (city) {
      locations = await locationRepository.findByCity(city)
    } else if (country) {
      locations = await locationRepository.findByCountry(country)
    } else if (category) {
      locations = await locationRepository.findByCategory(category)
    } else {
      return res.status(400).json({ error: 'city, country, or category parameter required' })
    }

    res.json({
      locations: locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        country: loc.country,
        description: loc.description,
        officialUrl: loc.officialUrl,
        category: loc.category,
        tags: loc.tags,
        rating: loc.rating,
        userRatingsTotal: loc.userRatingsTotal,
      })),
    })
  } catch (error: any) {
    console.error('Error listing locations:', error)
    res.status(500).json({ error: error.message || 'Failed to list locations' })
  }
})

/**
 * GET /api/travel/locations/:id
 * Get location details
 */
router.get('/locations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const refresh = req.query.refresh === 'true'

    const location = await getLocationDetailsUseCase.execute({
      locationId: id,
      refresh,
    })

    res.json({
      location: {
        id: location.id,
        name: location.name,
        city: location.city,
        country: location.country,
        description: location.description,
        officialUrl: location.officialUrl,
        category: location.category,
        tags: location.tags,
        metadata: location.metadata,
        rating: location.rating,
        userRatingsTotal: location.userRatingsTotal,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    })
  } catch (error: any) {
    console.error('Error getting location details:', error)
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: error.message || 'Failed to get location details' })
  }
})

/**
 * GET /api/travel/locations/:id/alternatives
 * Get alternative locations
 */
router.get('/locations/:id/alternatives', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const radius = req.query.radius ? parseInt(req.query.radius as string) : undefined
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined

    const alternatives = await getLocationAlternativesUseCase.execute({
      locationId: id,
      radius,
      limit,
    })

    res.json({
      alternatives: alternatives.map(loc => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        country: loc.country,
        description: loc.description,
        officialUrl: loc.officialUrl,
        category: loc.category,
        tags: loc.tags,
        rating: loc.rating,
        userRatingsTotal: loc.userRatingsTotal,
      })),
    })
  } catch (error: any) {
    console.error('Error getting alternatives:', error)
    res.status(500).json({ error: error.message || 'Failed to get alternatives' })
  }
})

/**
 * POST /api/travel/locations/:id/save
 * Save location to user's list
 */
router.post('/locations/:id/save', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'demo-user-id' // TODO: Extract from auth token
    const { id } = req.params
    const { notes, isFavorite } = req.body

    const savedLocation = await saveLocationUseCase.execute({
      userId,
      locationId: id,
      notes,
      isFavorite,
    })

    res.json({
      savedLocation: {
        id: savedLocation.id,
        userId: savedLocation.userId,
        locationId: savedLocation.locationId,
        notes: savedLocation.notes,
        isFavorite: savedLocation.isFavorite,
      },
    })
  } catch (error: any) {
    console.error('Error saving location:', error)
    res.status(500).json({ error: error.message || 'Failed to save location' })
  }
})

/**
 * GET /api/travel/saved
 * Get user's saved locations
 */
router.get('/saved', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'demo-user-id' // TODO: Extract from auth token
    const favorites = req.query.favorites === 'true'

    let savedLocations
    if (favorites) {
      savedLocations = await savedLocationRepository.findFavorites(userId)
    } else {
      savedLocations = await savedLocationRepository.findByUserId(userId)
    }

    // Get location details for each saved location
    const locations = await Promise.all(
      savedLocations.map(async (saved) => {
        const location = await locationRepository.findById(saved.locationId)
        return {
          savedLocation: {
            id: saved.id,
            notes: saved.notes,
            isFavorite: saved.isFavorite,
            createdAt: saved.createdAt,
          },
          location: location ? {
            id: location.id,
            name: location.name,
            city: location.city,
            country: location.country,
            description: location.description,
            officialUrl: location.officialUrl,
            category: location.category,
            rating: location.rating,
          } : null,
        }
      })
    )

    res.json({ locations })
  } catch (error: any) {
    console.error('Error getting saved locations:', error)
    res.status(500).json({ error: error.message || 'Failed to get saved locations' })
  }
})

/**
 * POST /api/travel/locations/search
 * Search locations via Google Places API
 */
router.post('/locations/search', async (req: Request, res: Response) => {
  try {
    const { query, location, limit } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const locations = await searchLocationsUseCase.execute({
      query,
      location,
      limit,
    })

    res.json({
      locations: locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        country: loc.country,
        description: loc.description,
        officialUrl: loc.officialUrl,
        category: loc.category,
        tags: loc.tags,
        rating: loc.rating,
        userRatingsTotal: loc.userRatingsTotal,
      })),
    })
  } catch (error: any) {
    console.error('Error searching locations:', error)
    res.status(500).json({ error: error.message || 'Failed to search locations' })
  }
})

export default router

