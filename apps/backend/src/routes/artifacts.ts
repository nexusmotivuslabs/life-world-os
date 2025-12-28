/**
 * Artifact Routes
 * 
 * REST API endpoints for unified Artifact system.
 * Provides read-only access to artifacts and their relationships.
 */

import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { ArtifactCategory } from '@prisma/client'

const router = Router()

/**
 * GET /api/artifacts
 * List all artifacts with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as ArtifactCategory | undefined
    const systemId = req.query.systemId as string | undefined
    const systemType = req.query.systemType as string | undefined
    const search = req.query.search as string | undefined
    const isActive = req.query.isActive === 'false' ? false : true // Default to active only

    const where: any = {
      isActive,
    }

    if (category) where.category = category
    if (systemId) where.systemId = systemId
    if (systemType) where.systemType = systemType

    // Basic search (title and description)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const artifacts = await prisma.artifact.findMany({
      where,
      orderBy: [
        { orderIndex: 'asc' },
        { title: 'asc' },
      ],
      include: {
        realityNode: {
          select: {
            id: true,
            title: true,
            nodeType: true,
            category: true,
          },
        },
        references: {
          include: {
            toArtifact: {
              select: {
                id: true,
                title: true,
                category: true,
                iconName: true,
              },
            },
          },
        },
        referencedBy: {
          include: {
            fromArtifact: {
              select: {
                id: true,
                title: true,
                category: true,
                iconName: true,
              },
            },
          },
        },
      },
    })

    res.json({
      artifacts,
      count: artifacts.length,
    })
  } catch (error: any) {
    console.error('Error listing artifacts:', error)
    res.status(500).json({ error: error.message || 'Failed to list artifacts' })
  }
})

/**
 * GET /api/artifacts/:id
 * Get a single artifact by ID with full relationships
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const artifact = await prisma.artifact.findUnique({
      where: { id },
      include: {
        realityNode: {
          select: {
            id: true,
            title: true,
            description: true,
            nodeType: true,
            category: true,
          },
        },
        references: {
          include: {
            toArtifact: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                iconName: true,
                route: true,
                tags: true,
              },
            },
          },
          orderBy: { strength: 'desc' },
        },
        referencedBy: {
          include: {
            fromArtifact: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                iconName: true,
                route: true,
                tags: true,
              },
            },
          },
          orderBy: { strength: 'desc' },
        },
      },
    })

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' })
    }

    res.json({ artifact })
  } catch (error: any) {
    console.error('Error getting artifact:', error)
    res.status(500).json({ error: error.message || 'Failed to get artifact' })
  }
})

/**
 * GET /api/artifacts/by-category/:category
 * Get all artifacts in a specific category
 */
router.get('/by-category/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params.category as ArtifactCategory

    if (!Object.values(ArtifactCategory).includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }

    const artifacts = await prisma.artifact.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: [
        { orderIndex: 'asc' },
        { title: 'asc' },
      ],
      include: {
        realityNode: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    res.json({
      artifacts,
      count: artifacts.length,
      category,
    })
  } catch (error: any) {
    console.error('Error getting artifacts by category:', error)
    res.status(500).json({ error: error.message || 'Failed to get artifacts by category' })
  }
})

/**
 * GET /api/artifacts/:id/relationships
 * Get all relationships for an artifact
 */
router.get('/:id/relationships', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const relationshipType = req.query.type as string | undefined

    const where: any = {
      OR: [
        { fromId: id },
        { toId: id },
      ],
    }

    if (relationshipType) {
      where.type = relationshipType
    }

    const relationships = await prisma.artifactReference.findMany({
      where,
      include: {
        fromArtifact: {
          select: {
            id: true,
            title: true,
            category: true,
            iconName: true,
          },
        },
        toArtifact: {
          select: {
            id: true,
            title: true,
            category: true,
            iconName: true,
          },
        },
      },
      orderBy: { strength: 'desc' },
    })

    res.json({
      relationships,
      count: relationships.length,
    })
  } catch (error: any) {
    console.error('Error getting artifact relationships:', error)
    res.status(500).json({ error: error.message || 'Failed to get artifact relationships' })
  }
})

export default router

