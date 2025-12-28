import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger.js'

const router = Router()

const cloudTypes = ['capacity', 'engines', 'oxygen', 'meaning', 'optionality'] as const

const updateCloudSchema = z.object({
  strength: z.number().min(0).max(100),
})

// Get all cloud strengths
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const cloud = await prisma.cloud.findUnique({
      where: { userId },
    })

    if (!cloud) {
      return res.status(404).json({ error: 'Cloud data not found' })
    }

    res.json({
      capacity: cloud.capacityStrength,
      engines: cloud.enginesStrength,
      oxygen: cloud.oxygenStrength,
      meaning: cloud.meaningStrength,
      optionality: cloud.optionalityStrength,
      lastUpdated: cloud.lastUpdated,
    })
  } catch (error) {
    logger.error('Get clouds error:', error)
    res.status(500).json({ error: 'Failed to get clouds' })
  }
})

// Update specific cloud strength
router.put('/:cloudType', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const { cloudType } = req.params
    const { strength } = updateCloudSchema.parse(req.body)

    if (!cloudTypes.includes(cloudType as any)) {
      return res.status(400).json({ error: 'Invalid cloud type' })
    }

    const fieldMap: Record<string, keyof typeof prisma.cloud.fields> = {
      capacity: 'capacityStrength',
      engines: 'enginesStrength',
      oxygen: 'oxygenStrength',
      meaning: 'meaningStrength',
      optionality: 'optionalityStrength',
    }

    const cloud = await prisma.cloud.update({
      where: { userId },
      data: {
        [fieldMap[cloudType]]: strength,
      },
    })

    res.json({
      [cloudType]: cloud[fieldMap[cloudType] as keyof typeof cloud],
      lastUpdated: cloud.lastUpdated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    logger.error('Update cloud error:', error)
    res.status(500).json({ error: 'Failed to update cloud' })
  }
})

export default router


