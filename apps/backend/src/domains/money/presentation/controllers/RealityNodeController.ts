/**
 * RealityNodeController
 * 
 * Presentation layer controller for Reality hierarchy endpoints.
 * Provides read-only access to Reality nodes and their relationships.
 */

import { Router, Request, Response } from 'express'
import { prisma } from '../../../../lib/prisma.js'
import { getOrSet, cacheKeys } from '../../../../lib/cache.js'
import { resolveNodeForSystem } from '../../../../lib/resolveSystemLens.js'
import { RealityNodeType, RealityNodeCategory } from '@prisma/client'

const router = Router()

/**
 * GET /api/reality-nodes
 * List all reality nodes with optional filters
 * Supports HTTP cache headers for efficient caching
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const parentId = req.query.parentId as string | undefined
    const nodeType = req.query.nodeType as RealityNodeType | undefined
    const category = req.query.category as RealityNodeCategory | undefined
    const immutable = req.query.immutable === 'true' ? true : req.query.immutable === 'false' ? false : undefined

    const where: any = {}
    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        where.parentId = null
      } else {
        where.parentId = parentId
      }
    }
    if (nodeType) where.nodeType = nodeType
    if (category) where.category = category
    if (immutable !== undefined) where.immutable = immutable

    const nodes = await prisma.realityNode.findMany({
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
            nodeType: true,
            category: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            description: true,
            nodeType: true,
            category: true,
            immutable: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=300') // 5 minutes
    
    // Generate ETag based on query params and node count
    const cacheKey = `${parentId || 'null'}-${nodeType || 'all'}-${category || 'all'}-${immutable || 'all'}-${nodes.length}`
    const etag = `"${Buffer.from(cacheKey).toString('base64').substring(0, 16)}"`
    res.setHeader('ETag', etag)

    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match']
    if (ifNoneMatch === etag) {
      return res.status(304).end() // Not Modified
    }

    res.json({
      nodes,
      count: nodes.length,
    })
  } catch (error: any) {
    console.error('Error listing reality nodes:', error)
    res.status(500).json({ error: error.message || 'Failed to list reality nodes' })
  }
})

/**
 * GET /api/reality-nodes/roots
 * Get all root nodes (parentId: null)
 */
router.get('/roots', async (req: Request, res: Response) => {
  try {
    const roots = await prisma.realityNode.findMany({
      where: { parentId: null },
      orderBy: { orderIndex: 'asc' },
      include: {
        children: {
          select: {
            id: true,
            title: true,
            description: true,
            nodeType: true,
            category: true,
            immutable: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    res.json({
      roots,
      count: roots.length,
    })
  } catch (error: any) {
    console.error('Error fetching root nodes:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch root nodes' })
  }
})

/**
 * GET /api/reality-nodes/:id
 * Get a specific node by ID with full hierarchy context.
 * Optional ?systemId= returns system lens content when present (reference nodes resolve from source).
 * Supports HTTP cache headers (ETag, Last-Modified) when systemId is not used.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const systemId = (req.query.systemId as string)?.trim() || undefined

    let node = await (systemId
      ? prisma.realityNode.findUnique({
          where: { id },
          include: {
            parent: {
              include: {
                parent: {
                  include: { parent: true },
                },
              },
            },
            children: {
              select: {
                id: true,
                title: true,
                description: true,
                nodeType: true,
                category: true,
                immutable: true,
                orderIndex: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        })
      : getOrSet(cacheKeys.realityNode(id), async () => {
          return prisma.realityNode.findUnique({
            where: { id },
            include: {
              parent: {
                include: {
                  parent: {
                    include: { parent: true },
                  },
                },
              },
              children: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  nodeType: true,
                  category: true,
                  immutable: true,
                  orderIndex: true,
                },
                orderBy: { orderIndex: 'asc' },
              },
            },
          })
        }))

    if (!node) {
      return res.status(404).json({ error: 'Node not found' })
    }

    let sourceNode: typeof node | null = null
    const meta = node.metadata as Record<string, unknown> | null | undefined
    if (systemId && meta?.isReference && typeof meta.sourceRealityNodeId === 'string') {
      sourceNode = await prisma.realityNode.findUnique({
        where: { id: meta.sourceRealityNodeId },
      })
    }

    const resolved: Record<string, unknown> = systemId
      ? resolveNodeForSystem(node as any, systemId, sourceNode ?? undefined)
      : (node as unknown as Record<string, unknown>)

    if (!systemId) {
      const lm = node.updatedAt || node.createdAt
      const lastModified = lm instanceof Date ? lm : new Date(lm as string)
      const etag = `"${node.id}-${lastModified.getTime()}"`
      res.setHeader('Last-Modified', lastModified.toUTCString())
      res.setHeader('ETag', etag)
      res.setHeader('Cache-Control', 'public, max-age=300')
      const ifNoneMatch = req.headers['if-none-match']
      const ifModifiedSince = req.headers['if-modified-since']
      if (ifNoneMatch === etag) return res.status(304).end()
      if (ifModifiedSince && lastModified <= new Date(ifModifiedSince)) return res.status(304).end()
    } else {
      res.setHeader('Cache-Control', 'public, max-age=60')
    }

    res.json({ node: resolved } as { node: typeof node })
  } catch (error: any) {
    console.error('Error fetching node:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch node' })
  }
})

/**
 * GET /api/reality-nodes/:id/ancestors
 * Get the ancestor chain from node to REALITY root
 */
router.get('/:id/ancestors', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const ancestors: any[] = []
    let currentNode = await prisma.realityNode.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    })

    if (!currentNode) {
      return res.status(404).json({ error: 'Node not found' })
    }

    // Build ancestor chain
    while (currentNode.parentId) {
      const parent = await prisma.realityNode.findUnique({
        where: { id: currentNode.parentId },
        include: {
          parent: true,
        },
      })

      if (!parent) break

      ancestors.unshift({
        id: parent.id,
        title: parent.title,
        description: parent.description,
        nodeType: parent.nodeType,
        category: parent.category,
        immutable: parent.immutable,
        orderIndex: parent.orderIndex,
      })

      currentNode = parent
    }

    // Add the current node at the end
    ancestors.push({
      id: currentNode.id,
      title: currentNode.title,
      description: currentNode.description,
      nodeType: currentNode.nodeType,
      category: currentNode.category,
      immutable: currentNode.immutable,
      orderIndex: currentNode.orderIndex,
    })

    res.json({
      ancestors,
      depth: ancestors.length - 1, // Depth from REALITY (0 = REALITY itself)
    })
  } catch (error: any) {
    console.error('Error fetching ancestors:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch ancestors' })
  }
})

/**
 * GET /api/reality-nodes/:id/children
 * Get all children of a node
 * Supports HTTP cache headers for efficient caching
 */
router.get('/:id/children', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { children, count } = await getOrSet(
      cacheKeys.realityNodeChildren(id),
      async () => {
        const list = await prisma.realityNode.findMany({
          where: { parentId: id },
          orderBy: [
            { orderIndex: 'asc' },
            { title: 'asc' },
          ],
          include: {
            children: {
              select: {
                id: true,
                title: true,
                nodeType: true,
                category: true,
                orderIndex: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        })
        return { children: list, count: list.length }
      }
    )

    const maxUpdatedAtForHeaders = children?.length
      ? children.reduce((max: Date | null, child: any) => {
          const updated = child?.updatedAt || child?.createdAt
          if (updated && (!max || (updated instanceof Date ? updated : new Date(updated)) > max))
            return updated instanceof Date ? updated : new Date(updated)
          return max
        }, null as Date | null)
      : null
    if (maxUpdatedAtForHeaders) {
      const etag = `"children-${id}-${maxUpdatedAtForHeaders.getTime()}"`
      res.setHeader('Last-Modified', maxUpdatedAtForHeaders.toUTCString())
      res.setHeader('ETag', etag)
      res.setHeader('Cache-Control', 'public, max-age=300') // 5 minutes

      const ifNoneMatch = req.headers['if-none-match']
      if (ifNoneMatch === etag) {
        return res.status(304).end() // Not Modified
      }
    }

    res.json({
      children,
      count,
    })
  } catch (error: any) {
    console.error('Error fetching children:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch children' })
  }
})

/**
 * GET /api/reality-nodes/:id/hierarchy
 * Get full hierarchy context: ancestors + node + children
 * Supports HTTP cache headers for efficient caching
 */
router.get('/:id/hierarchy', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const systemId = (req.query.systemId as string)?.trim() || undefined

    const node = await prisma.realityNode.findUnique({
      where: { id },
      include: {
        children: {
          select: {
            id: true,
            title: true,
            description: true,
            nodeType: true,
            category: true,
            immutable: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!node) {
      return res.status(404).json({ error: 'Node not found' })
    }

    let sourceNode: typeof node | null = null
    const meta = node.metadata as Record<string, unknown> | null | undefined
    if (systemId && meta?.isReference && typeof meta.sourceRealityNodeId === 'string') {
      sourceNode = await prisma.realityNode.findUnique({
        where: { id: meta.sourceRealityNodeId },
      })
    }
    const resolvedNode = systemId
      ? resolveNodeForSystem(node as any, systemId, sourceNode ?? undefined)
      : {
          id: node.id,
          title: node.title,
          description: node.description,
          nodeType: node.nodeType,
          category: node.category,
          immutable: node.immutable,
          orderIndex: node.orderIndex,
          metadata: node.metadata,
        }

    const ancestors: any[] = []
    let currentNode: any = node
    while (currentNode.parentId) {
      const parent = await prisma.realityNode.findUnique({
        where: { id: currentNode.parentId },
      })

      if (!parent) break

      ancestors.unshift({
        id: parent.id,
        title: parent.title,
        description: parent.description,
        nodeType: parent.nodeType,
        category: parent.category,
        immutable: parent.immutable,
        orderIndex: parent.orderIndex,
      })

      currentNode = parent
    }

    const lastModified = node.updatedAt || node.createdAt
    const lm = lastModified instanceof Date ? lastModified : new Date(lastModified as string)
    const etag = `"hierarchy-${id}-${lm.getTime()}"`
    res.setHeader('Last-Modified', lm.toUTCString())
    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', systemId ? 'public, max-age=60' : 'public, max-age=300')
    const ifNoneMatch = req.headers['if-none-match']
    if (ifNoneMatch === etag) return res.status(304).end()

    res.json({
      ancestors,
      node: resolvedNode as any,
      children: node.children,
      depth: ancestors.length,
    })
  } catch (error: any) {
    console.error('Error fetching hierarchy:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch hierarchy' })
  }
})

export default router


