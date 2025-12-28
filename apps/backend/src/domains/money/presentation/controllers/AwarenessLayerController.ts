/**
 * AwarenessLayerController
 * 
 * Presentation layer controller for Awareness Layers endpoints.
 */

import { Router, Request, Response } from 'express'
import { prisma } from '../../../../lib/prisma.js'
import { AwarenessLayerCategory } from '@prisma/client'

const router = Router()

/**
 * GET /api/awareness-layers
 * List all awareness layers with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as AwarenessLayerCategory | undefined
    const parentId = req.query.parentId as string | undefined
    const isRoot = req.query.isRoot === 'true' ? true : req.query.isRoot === 'false' ? false : undefined

    const where: any = {}
    if (category) where.category = category
    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        where.parentId = null
      } else {
        where.parentId = parentId
      }
    }
    if (isRoot !== undefined) where.isRoot = isRoot

    const layers = await prisma.awarenessLayer.findMany({
      where,
      orderBy: [
        { orderIndex: 'asc' },
        { title: 'asc' },
      ],
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            category: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    res.json({
      layers,
      count: layers.length,
    })
  } catch (error: any) {
    console.error('Error listing awareness layers:', error)
    res.status(500).json({ error: error.message || 'Failed to list awareness layers' })
  }
})

/**
 * GET /api/awareness-layers/roots
 * Get all root awareness layers (isRoot: true or parentId: null)
 */
router.get('/roots', async (req: Request, res: Response) => {
  try {
    const layers = await prisma.awarenessLayer.findMany({
      where: {
        OR: [
          { isRoot: true },
          { parentId: null },
        ],
      },
      orderBy: [
        { orderIndex: 'asc' },
        { title: 'asc' },
      ],
      include: {
        children: {
          select: {
            id: true,
            title: true,
            category: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    res.json({
      layers,
      count: layers.length,
    })
  } catch (error: any) {
    console.error('Error getting root awareness layers:', error)
    res.status(500).json({ error: error.message || 'Failed to get root awareness layers' })
  }
})

/**
 * GET /api/awareness-layers/:id
 * Get a specific awareness layer by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const layer = await prisma.awarenessLayer.findUnique({
      where: { id: req.params.id },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            category: true,
            orderIndex: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            category: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!layer) {
      return res.status(404).json({ error: 'Awareness layer not found' })
    }

    res.json(layer)
  } catch (error: any) {
    console.error('Error getting awareness layer:', error)
    res.status(500).json({ error: error.message || 'Failed to get awareness layer' })
  }
})

/**
 * GET /api/awareness-layers/:id/children
 * Get all children of a specific awareness layer
 */
router.get('/:id/children', async (req: Request, res: Response) => {
  try {
    const children = await prisma.awarenessLayer.findMany({
      where: { parentId: req.params.id },
      orderBy: [
        { orderIndex: 'asc' },
        { title: 'asc' },
      ],
    })

    res.json({
      children,
      count: children.length,
    })
  } catch (error: any) {
    console.error('Error getting children:', error)
    res.status(500).json({ error: error.message || 'Failed to get children' })
  }
})

/**
 * GET /api/awareness-layers/categories
 * Get awareness layers grouped by category
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = Object.values(AwarenessLayerCategory)
    
    const layersByCategory = await Promise.all(
      categories.map(async (category) => {
        const layers = await prisma.awarenessLayer.findMany({
          where: { category },
          orderBy: [
            { orderIndex: 'asc' },
            { title: 'asc' },
          ],
          include: {
            parent: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        })
        return { category, layers, count: layers.length }
      })
    )

    res.json({ categories: layersByCategory })
  } catch (error: any) {
    console.error('Error getting layers by category:', error)
    res.status(500).json({ error: error.message || 'Failed to get layers by category' })
  }
})

/**
 * POST /api/awareness-layers
 * Create a new awareness layer (admin)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, category, parentId, orderIndex, isRoot, metadata } = req.body

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' })
    }

    // Validate category
    if (!Object.values(AwarenessLayerCategory).includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const parent = await prisma.awarenessLayer.findUnique({
        where: { id: parentId },
      })
      if (!parent) {
        return res.status(400).json({ error: 'Parent awareness layer not found' })
      }
    }

    const layer = await prisma.awarenessLayer.create({
      data: {
        title,
        description,
        category,
        parentId: parentId || null,
        orderIndex: orderIndex || 0,
        isRoot: isRoot !== undefined ? isRoot : (parentId === null || parentId === undefined),
        metadata: metadata || null,
      },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    })

    res.status(201).json(layer)
  } catch (error: any) {
    console.error('Error creating awareness layer:', error)
    res.status(500).json({ error: error.message || 'Failed to create awareness layer' })
  }
})

/**
 * PUT /api/awareness-layers/:id
 * Update an awareness layer (admin)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, category, parentId, orderIndex, isRoot, metadata } = req.body

    // Check if layer exists
    const existing = await prisma.awarenessLayer.findUnique({
      where: { id: req.params.id },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Awareness layer not found' })
    }

    // Validate category if provided
    if (category && !Object.values(AwarenessLayerCategory).includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }

    // If parentId is being changed, verify it exists and doesn't create a cycle
    if (parentId !== undefined && parentId !== existing.parentId) {
      if (parentId) {
        const parent = await prisma.awarenessLayer.findUnique({
          where: { id: parentId },
        })
        if (!parent) {
          return res.status(400).json({ error: 'Parent awareness layer not found' })
        }
        // Prevent self-reference
        if (parentId === req.params.id) {
          return res.status(400).json({ error: 'Cannot set self as parent' })
        }
        // Prevent circular reference (check if parent is a descendant)
        const descendants = await prisma.awarenessLayer.findMany({
          where: { parentId: req.params.id },
        })
        const descendantIds = descendants.map(d => d.id)
        if (descendantIds.includes(parentId)) {
          return res.status(400).json({ error: 'Cannot create circular reference' })
        }
      }
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (parentId !== undefined) {
      updateData.parentId = parentId || null
      // Auto-update isRoot if parentId changes
      if (isRoot === undefined) {
        updateData.isRoot = (parentId === null || parentId === undefined)
      }
    }
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex
    if (isRoot !== undefined) updateData.isRoot = isRoot
    if (metadata !== undefined) updateData.metadata = metadata

    const layer = await prisma.awarenessLayer.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            category: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    res.json(layer)
  } catch (error: any) {
    console.error('Error updating awareness layer:', error)
    res.status(500).json({ error: error.message || 'Failed to update awareness layer' })
  }
})

export default router


