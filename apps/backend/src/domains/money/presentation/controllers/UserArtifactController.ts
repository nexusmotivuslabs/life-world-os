/**
 * UserArtifactController
 * 
 * Presentation layer controller for user artifact endpoints.
 */

import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaUserArtifactRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaUserArtifactRepositoryAdapter.js'
import { SaveUserArtifactUseCase } from '../../application/useCases/SaveUserArtifactUseCase.js'
import { prisma } from '../../../../lib/prisma.js'
import { authenticateToken, AuthRequest } from '../../../../middleware/auth.js'

const router = Router()

// All artifact routes require authentication
router.use(authenticateToken)

// Initialize adapters
const artifactRepository = new PrismaUserArtifactRepositoryAdapter(prisma)
const saveArtifactUseCase = new SaveUserArtifactUseCase(artifactRepository)

/**
 * POST /api/artifacts
 * Save a new artifact (recommendation, calculation, etc.)
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!

    const { productId, productName, type, title, data, description, tags } = req.body

    if (!productName || !type || !title || !data) {
      return res.status(400).json({ error: 'Missing required fields: productName, type, title, data' })
    }

    const artifact = await saveArtifactUseCase.execute({
      userId,
      productId,
      productName,
      type,
      title,
      data,
      description,
      tags,
    })

    res.status(201).json({
      artifact: {
        id: artifact.id,
        userId: artifact.userId,
        productId: artifact.productId,
        productName: artifact.productName,
        type: artifact.type,
        title: artifact.title,
        description: artifact.description,
        data: artifact.data,
        tags: artifact.tags,
        isFavorite: artifact.isFavorite,
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('Error saving artifact:', error)
    res.status(500).json({ error: error.message || 'Failed to save artifact' })
  }
})

/**
 * GET /api/artifacts
 * List all artifacts for the user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const type = req.query.type as string | undefined
    const favorites = req.query.favorites === 'true'
    const productId = req.query.productId as string | undefined

    let artifacts

    if (favorites) {
      artifacts = await artifactRepository.findFavorites(userId)
    } else if (productId) {
      artifacts = await artifactRepository.findByProductId(productId)
    } else if (type) {
      artifacts = await artifactRepository.findByType(userId, type as any)
    } else {
      artifacts = await artifactRepository.findByUserId(userId)
    }

    res.json({
      artifacts: artifacts.map(a => ({
        id: a.id,
        userId: a.userId,
        productId: a.productId,
        productName: a.productName,
        type: a.type,
        title: a.title,
        description: a.description,
        data: a.data,
        tags: a.tags,
        isFavorite: a.isFavorite,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    })
  } catch (error: any) {
    console.error('Error listing artifacts:', error)
    res.status(500).json({ error: error.message || 'Failed to list artifacts' })
  }
})

/**
 * GET /api/artifacts/search
 * Search artifacts
 */
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const query = req.query.q as string

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    const artifacts = await artifactRepository.search(userId, query)

    res.json({
      artifacts: artifacts.map(a => ({
        id: a.id,
        userId: a.userId,
        productId: a.productId,
        productName: a.productName,
        type: a.type,
        title: a.title,
        description: a.description,
        data: a.data,
        tags: a.tags,
        isFavorite: a.isFavorite,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    })
  } catch (error: any) {
    console.error('Error searching artifacts:', error)
    res.status(500).json({ error: error.message || 'Failed to search artifacts' })
  }
})

/**
 * GET /api/artifacts/:id
 * Get artifact by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const artifact = await artifactRepository.findById(req.params.id)

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' })
    }

    // Verify artifact belongs to user
    if (artifact.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({
      artifact: {
        id: artifact.id,
        userId: artifact.userId,
        productId: artifact.productId,
        productName: artifact.productName,
        type: artifact.type,
        title: artifact.title,
        description: artifact.description,
        data: artifact.data,
        tags: artifact.tags,
        isFavorite: artifact.isFavorite,
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('Error getting artifact:', error)
    res.status(500).json({ error: error.message || 'Failed to get artifact' })
  }
})

/**
 * PUT /api/artifacts/:id/favorite
 * Toggle favorite status
 */
router.put('/:id/favorite', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const artifact = await artifactRepository.findById(req.params.id)

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' })
    }

    // Verify artifact belongs to user
    if (artifact.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updated = artifact.isFavorite
      ? artifact.unmarkAsFavorite()
      : artifact.markAsFavorite()

    const saved = await artifactRepository.save(updated)

    res.json({
      artifact: {
        id: saved.id,
        isFavorite: saved.isFavorite,
      },
    })
  } catch (error: any) {
    console.error('Error updating favorite status:', error)
    res.status(500).json({ error: error.message || 'Failed to update favorite status' })
  }
})

/**
 * DELETE /api/artifacts/:id
 * Delete artifact
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const artifact = await artifactRepository.findById(req.params.id)
    
    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' })
    }

    // Verify artifact belongs to user
    if (artifact.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await artifactRepository.delete(req.params.id)
    res.json({ message: 'Artifact deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting artifact:', error)
    res.status(500).json({ error: error.message || 'Failed to delete artifact' })
  }
})

export default router





