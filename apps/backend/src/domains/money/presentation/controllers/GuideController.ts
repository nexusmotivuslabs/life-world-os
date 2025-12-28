/**
 * GuideController
 * 
 * Presentation layer controller for guide-related endpoints.
 */

import { Router, Request, Response } from 'express'
import { StartGuideUseCase } from '../../application/useCases/StartGuideUseCase.js'
import { ExecuteGuideStepUseCase } from '../../application/useCases/ExecuteGuideStepUseCase.js'
import { PrismaGuideRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaGuideRepositoryAdapter.js'
import { PrismaSessionRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaSessionRepositoryAdapter.js'
import { prisma } from '../../../../lib/prisma.js'
import { logger } from '../lib/logger.js'

const router = Router()

// Note: In production, add authentication middleware here
// router.use(authenticateToken)

// Initialize adapters and use cases
const guideRepository = new PrismaGuideRepositoryAdapter(prisma)
const sessionRepository = new PrismaSessionRepositoryAdapter(prisma)

const startGuideUseCase = new StartGuideUseCase(
  guideRepository,
  sessionRepository
)

const executeGuideStepUseCase = new ExecuteGuideStepUseCase(
  guideRepository,
  sessionRepository
)

/**
 * GET /api/guides
 * List all guides
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string | undefined
    const teamId = req.query.teamId as string | undefined

    let guides
    if (agentId) {
      guides = await guideRepository.findByAgentId(agentId)
    } else if (teamId) {
      guides = await guideRepository.findByTeamId(teamId)
    } else {
      guides = await guideRepository.findAll()
    }

    res.json({
      guides: guides.map(guide => ({
        id: guide.id,
        agentId: guide.agentId,
        teamId: guide.teamId,
        title: guide.title,
        description: guide.description,
        category: guide.category,
        difficulty: guide.difficulty,
        estimatedTime: guide.estimatedTime,
        totalSteps: guide.getTotalSteps(),
        isTeamGuide: guide.isTeamGuide,
      })),
    })
  } catch (error: any) {
    logger.error('Error listing guides:', error)
    res.status(500).json({ error: error.message || 'Failed to list guides' })
  }
})

/**
 * GET /api/guides/:guideId
 * Get guide details
 */
router.get('/:guideId', async (req: Request, res: Response) => {
  try {
    const guide = await guideRepository.findById(req.params.guideId)
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' })
    }

    res.json({
      id: guide.id,
      agentId: guide.agentId,
      teamId: guide.teamId,
      title: guide.title,
      description: guide.description,
      steps: guide.steps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.description,
        instructions: step.instructions,
        isOptional: step.isOptional,
        order: step.order,
      })),
      category: guide.category,
      difficulty: guide.difficulty,
      estimatedTime: guide.estimatedTime,
      prerequisites: guide.prerequisites,
      isTeamGuide: guide.isTeamGuide,
    })
  } catch (error: any) {
    logger.error('Error getting guide:', error)
    res.status(500).json({ error: error.message || 'Failed to get guide' })
  }
})

/**
 * POST /api/guides/:guideId/start
 * Start a guide workflow
 */
router.post('/:guideId/start', async (req: Request, res: Response) => {
  try {
    // TODO: Add proper authentication middleware
    const userId = (req as any).userId || 'demo-user' // Temporary for development
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { agentId, teamId } = req.body

    const response = await startGuideUseCase.execute({
      userId,
      guideId: req.params.guideId,
      agentId,
      teamId,
    })

    res.json(response)
  } catch (error: any) {
    logger.error('Error starting guide:', error)
    res.status(500).json({ error: error.message || 'Failed to start guide' })
  }
})

/**
 * POST /api/guides/sessions/:sessionId/step
 * Execute a guide step
 */
router.post('/sessions/:sessionId/step', async (req: Request, res: Response) => {
  try {
    // TODO: Add proper authentication middleware
    const userId = (req as any).userId || 'demo-user' // Temporary for development
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { stepData } = req.body

    const response = await executeGuideStepUseCase.execute({
      userId,
      sessionId: req.params.sessionId,
      stepData,
    })

    res.json(response)
  } catch (error: any) {
    logger.error('Error executing guide step:', error)
    res.status(500).json({ error: error.message || 'Failed to execute guide step' })
  }
})

export default router

