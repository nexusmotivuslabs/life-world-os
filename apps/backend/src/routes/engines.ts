import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { EngineType, EngineStatus } from '../types'

const router = Router()

const createEngineSchema = z.object({
  type: z.nativeEnum(EngineType),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  fragilityScore: z.number().min(0).max(100).default(50),
  currentOutput: z.number().default(0),
  status: z.nativeEnum(EngineStatus).default(EngineStatus.PLANNING),
})

const updateEngineSchema = createEngineSchema.partial()

// List all engines
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const engines = await prisma.engine.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json(
      engines.map((e) => ({
        id: e.id,
        type: e.type,
        name: e.name,
        description: e.description,
        fragilityScore: e.fragilityScore,
        currentOutput: Number(e.currentOutput),
        status: e.status,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    )
  } catch (error) {
    console.error('Get engines error:', error)
    res.status(500).json({ error: 'Failed to get engines' })
  }
})

// Create new engine
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const data = createEngineSchema.parse(req.body)

    const engine = await prisma.engine.create({
      data: {
        userId,
        ...data,
        currentOutput: data.currentOutput,
      },
    })

    res.status(201).json({
      id: engine.id,
      type: engine.type,
      name: engine.name,
      description: engine.description,
      fragilityScore: engine.fragilityScore,
      currentOutput: Number(engine.currentOutput),
      status: engine.status,
      createdAt: engine.createdAt,
      updatedAt: engine.updatedAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Create engine error:', error)
    res.status(500).json({ error: 'Failed to create engine' })
  }
})

// Update engine
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { id } = req.params
    const data = updateEngineSchema.parse(req.body)

    // Verify ownership
    const existing = await prisma.engine.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Engine not found' })
    }

    const engine = await prisma.engine.update({
      where: { id },
      data: {
        ...data,
        currentOutput: data.currentOutput !== undefined ? data.currentOutput : undefined,
      },
    })

    res.json({
      id: engine.id,
      type: engine.type,
      name: engine.name,
      description: engine.description,
      fragilityScore: engine.fragilityScore,
      currentOutput: Number(engine.currentOutput),
      status: engine.status,
      createdAt: engine.createdAt,
      updatedAt: engine.updatedAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Update engine error:', error)
    res.status(500).json({ error: 'Failed to update engine' })
  }
})

// Delete engine
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { id } = req.params

    // Verify ownership
    const existing = await prisma.engine.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Engine not found' })
    }

    await prisma.engine.delete({
      where: { id },
    })

    res.json({ message: 'Engine deleted' })
  } catch (error) {
    console.error('Delete engine error:', error)
    res.status(500).json({ error: 'Failed to delete engine' })
  }
})

export default router


