import { Router } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { PortfolioRebalancingService } from '../domains/money/domain/services/PortfolioRebalancingService.js'
import { CreatePortfolioRebalancingConfigUseCase } from '../domains/money/application/useCases/CreatePortfolioRebalancingConfigUseCase.js'
import { UpdatePortfolioRebalancingConfigUseCase } from '../domains/money/application/useCases/UpdatePortfolioRebalancingConfigUseCase.js'
import { GetPortfolioRebalancingStatusUseCase } from '../domains/money/application/useCases/GetPortfolioRebalancingStatusUseCase.js'
import { GetRebalancingRecommendationsUseCase } from '../domains/money/application/useCases/GetRebalancingRecommendationsUseCase.js'

const router = Router()

// Initialize services
const rebalancingService = new PortfolioRebalancingService()
const createConfigUseCase = new CreatePortfolioRebalancingConfigUseCase(prisma, rebalancingService)
const updateConfigUseCase = new UpdatePortfolioRebalancingConfigUseCase(prisma, rebalancingService)
const getStatusUseCase = new GetPortfolioRebalancingStatusUseCase(prisma, rebalancingService)
const getRecommendationsUseCase = new GetRebalancingRecommendationsUseCase(getStatusUseCase)

// Validation schemas
const createConfigSchema = z.object({
  timeHorizonYears: z.number().int().min(1).max(100),
  incomeStability: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  emotionalTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  decisionDiscipline: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  targetStocksPercent: z.number().min(0).max(100).optional(),
  targetBondsPercent: z.number().min(0).max(100).optional(),
  rebalancingFrequency: z.enum(['ANNUAL', 'THRESHOLD_BASED']),
  driftThreshold: z.number().min(0).max(50),
  preferContributions: z.boolean().default(true),
  bondPurpose: z.array(z.string()),
})

const updateConfigSchema = z.object({
  timeHorizonYears: z.number().int().min(1).max(100).optional(),
  incomeStability: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  emotionalTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  decisionDiscipline: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  targetStocksPercent: z.number().min(0).max(100).optional(),
  targetBondsPercent: z.number().min(0).max(100).optional(),
  rebalancingFrequency: z.enum(['ANNUAL', 'THRESHOLD_BASED']).optional(),
  driftThreshold: z.number().min(0).max(50).optional(),
  preferContributions: z.boolean().optional(),
  bondPurpose: z.array(z.string()).optional(),
})

// GET /api/portfolio-rebalancing/config - Get user's config
router.get('/config', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    const config = await prisma.portfolioRebalancingConfig.findUnique({
      where: { userId },
    })

    if (!config) {
      return res.status(404).json({ error: 'Portfolio rebalancing config not found' })
    }

    res.json({
      id: config.id,
      userId: config.userId,
      timeHorizonYears: config.timeHorizonYears,
      incomeStability: config.incomeStability,
      emotionalTolerance: config.emotionalTolerance,
      decisionDiscipline: config.decisionDiscipline,
      targetStocksPercent: Number(config.targetStocksPercent),
      targetBondsPercent: Number(config.targetBondsPercent),
      rebalancingFrequency: config.rebalancingFrequency,
      driftThreshold: Number(config.driftThreshold),
      preferContributions: config.preferContributions,
      bondPurpose: config.bondPurpose as string[],
      lastRebalancedAt: config.lastRebalancedAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    })
  } catch (error) {
    console.error('Error getting portfolio rebalancing config:', error)
    res.status(500).json({ error: 'Failed to get portfolio rebalancing config' })
  }
})

// POST /api/portfolio-rebalancing/config - Create or update config
router.post('/config', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const data = createConfigSchema.parse(req.body)

    // Check if config exists
    const existing = await prisma.portfolioRebalancingConfig.findUnique({
      where: { userId },
    })

    let config
    if (existing) {
      // Update existing
      const updateData = updateConfigSchema.parse(req.body)
      config = await updateConfigUseCase.execute({
        userId,
        ...updateData,
      })
    } else {
      // Create new
      config = await createConfigUseCase.execute({
        userId,
        ...data,
      })
    }

    res.json(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Error creating/updating portfolio rebalancing config:', error)
    res.status(500).json({ 
      error: 'Failed to create/update portfolio rebalancing config',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT /api/portfolio-rebalancing/config - Update config
router.put('/config', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const data = updateConfigSchema.parse(req.body)

    const config = await updateConfigUseCase.execute({
      userId,
      ...data,
    })

    res.json(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Error updating portfolio rebalancing config:', error)
    res.status(500).json({ 
      error: 'Failed to update portfolio rebalancing config',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/portfolio-rebalancing/status - Get current allocation vs target
router.get('/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const availableContribution = req.query.availableContribution 
      ? Number(req.query.availableContribution) 
      : undefined

    const status = await getStatusUseCase.execute(userId, availableContribution)

    if (!status) {
      return res.status(404).json({ error: 'Portfolio rebalancing config not found' })
    }

    // Convert Money objects to numbers for JSON response
    res.json({
      needsRebalancing: status.needsRebalancing,
      currentAllocation: {
        stocksPercent: status.currentAllocation.stocksPercent,
        bondsPercent: status.currentAllocation.bondsPercent,
        stocksValue: status.currentAllocation.stocksValue.toNumber(),
        bondsValue: status.currentAllocation.bondsValue.toNumber(),
        totalValue: status.currentAllocation.totalValue.toNumber(),
      },
      targetAllocation: status.targetAllocation,
      drift: status.drift,
      recommendations: status.recommendations.map(rec => ({
        ...rec,
        adjustment: rec.adjustment.toNumber(),
      })),
      canUseContributions: status.canUseContributions,
      availableContributionAmount: status.availableContributionAmount?.toNumber(),
    })
  } catch (error) {
    console.error('Error getting portfolio rebalancing status:', error)
    res.status(500).json({ error: 'Failed to get portfolio rebalancing status' })
  }
})

// GET /api/portfolio-rebalancing/recommendations - Get rebalancing recommendations
router.get('/recommendations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const availableContribution = req.query.availableContribution 
      ? Number(req.query.availableContribution) 
      : undefined

    const recommendations = await getRecommendationsUseCase.execute(userId, availableContribution)

    // Convert Money objects to numbers for JSON response
    res.json({
      recommendations: recommendations.map(rec => ({
        ...rec,
        adjustment: rec.adjustment.toNumber(),
      })),
    })
  } catch (error) {
    console.error('Error getting rebalancing recommendations:', error)
    res.status(500).json({ error: 'Failed to get rebalancing recommendations' })
  }
})

export default router





