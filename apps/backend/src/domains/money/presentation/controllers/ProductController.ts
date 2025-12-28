/**
 * ProductController
 * 
 * Presentation layer controller for product-related endpoints.
 */

import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaProductRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaProductRepositoryAdapter.js'
import { EmergencyFundRepositoryAdapter } from '../../infrastructure/adapters/database/EmergencyFundRepositoryAdapter.js'
import {
  SetEmergencyFundGoalUseCase,
  UpdateEmergencyFundProgressUseCase,
  GetEmergencyFundStatusUseCase,
  CalculateEmergencyFundRequiredUseCase,
} from '../../application/useCases/EmergencyFundUseCases.js'
import { CalculateEmergencyFundWithRiskProfileUseCase } from '../../application/useCases/CalculateEmergencyFundWithRiskProfileUseCase.js'
import { EmploymentType, JobSecurity, RiskTolerance, IncomeStructure } from '../../domain/valueObjects/EmergencyFundRiskProfile.js'
import { prisma } from '../../../../lib/prisma.js'
import { logger } from '../lib/logger.js'

const router = Router()

// Initialize adapters
const productRepository = new PrismaProductRepositoryAdapter(prisma)
const emergencyFundRepository = new EmergencyFundRepositoryAdapter(prisma)

// Initialize use cases
const setGoalUseCase = new SetEmergencyFundGoalUseCase(emergencyFundRepository)
const updateProgressUseCase = new UpdateEmergencyFundProgressUseCase(emergencyFundRepository)
const getStatusUseCase = new GetEmergencyFundStatusUseCase(emergencyFundRepository)
const calculateRequiredUseCase = new CalculateEmergencyFundRequiredUseCase()
const calculateWithRiskProfileUseCase = new CalculateEmergencyFundWithRiskProfileUseCase()

/**
 * GET /api/products
 * List all products
 * 
 * RESILIENCE: Products are queried independently of teams. If teamId is provided
 * but team associations fail, the endpoint gracefully degrades by returning all
 * active products from the organization.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string | undefined
    
    let products
    if (teamId) {
      // Try to get products for this team, but handle failures gracefully
      try {
        products = await productRepository.findByTeamId(teamId)
        // If no products found for team (but no error), that's okay - return empty array
      } catch (teamError: any) {
        // RESILIENCE: If team-specific query fails, fall back to all active products
        // This ensures products remain available even when team data has issues
        logger.error(`⚠️  Warning: Failed to load products for team ${teamId}, falling back to all active products:`, teamError)
        products = await productRepository.findActiveProducts()
      }
    } else {
      // Get all active products (owned by organization, independent of teams)
      products = await productRepository.findActiveProducts()
    }

    // Get security information for all products
    const productIds = products.map(p => p.id)
    const securityRecords = await prisma.productSecurity.findMany({
      where: { productId: { in: productIds } },
    })
    const securityMap = new Map(securityRecords.map(s => [s.productId, s]))

    res.json({
      products: products.map(p => {
        const security = securityMap.get(p.id)
        return {
          id: p.id,
          organizationId: p.organizationId,
          name: p.name,
          description: p.description,
          type: p.type,
          icon: p.icon,
          features: p.features,
          integrationPoints: p.integrationPoints,
          isActive: p.isActive,
          order: p.order,
          url: p.url,
          accessUrl: p.accessUrl,
          securityLevel: p.securityLevel,
          requiresAuth: p.requiresAuth,
          security: security ? {
            complianceStandards: security.complianceStandards,
            encryptionAtRest: security.encryptionAtRest,
            encryptionInTransit: security.encryptionInTransit,
            authenticationMethod: security.authenticationMethod,
            lastSecurityReview: security.lastSecurityReview,
            nextSecurityReview: security.nextSecurityReview,
          } : undefined,
        }
      }),
    })
  } catch (error: any) {
    // RESILIENCE: Even if everything fails, return empty array instead of error
    // This prevents cascading failures and allows the frontend to handle gracefully
    logger.error('❌ Error listing products (returning empty array for resilience):', error)
    res.json({
      products: [],
      warning: 'Product listing encountered issues, but system remains operational',
    })
  }
})

/**
 * GET /api/products/:productId
 * Get product details including security information
 */
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const product = await productRepository.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Get security information if available
    const security = await prisma.productSecurity.findUnique({
      where: { productId: product.id },
    })

    res.json({
      id: product.id,
      organizationId: product.organizationId,
      name: product.name,
      description: product.description,
      type: product.type,
      icon: product.icon,
      features: product.features,
      integrationPoints: product.integrationPoints,
      isActive: product.isActive,
      order: product.order,
      url: product.url,
      accessUrl: product.accessUrl,
      securityLevel: product.securityLevel,
      requiresAuth: product.requiresAuth,
      security: security ? {
        complianceStandards: security.complianceStandards,
        encryptionAtRest: security.encryptionAtRest,
        encryptionInTransit: security.encryptionInTransit,
        authenticationMethod: security.authenticationMethod,
        lastSecurityReview: security.lastSecurityReview,
        nextSecurityReview: security.nextSecurityReview,
      } : undefined,
    })
  } catch (error: any) {
    logger.error('Error getting product:', error)
    res.status(500).json({ error: error.message || 'Failed to get product' })
  }
})

/**
 * POST /api/products/emergency-fund/goal
 * Set emergency fund goal
 */
router.post('/emergency-fund/goal', async (req: Request, res: Response) => {
  try {
    // TODO: Extract userId from authentication token
    const userId = req.body.userId || 'demo-user-id' // Temporary for development

    const { targetAmount, monthsCoverage, monthlyExpenses, currentAmount } = req.body

    if (!targetAmount || !monthsCoverage || !monthlyExpenses) {
      return res.status(400).json({
        error: 'targetAmount, monthsCoverage, and monthlyExpenses are required',
      })
    }

    const emergencyFund = await setGoalUseCase.execute(
      userId,
      targetAmount,
      monthsCoverage,
      monthlyExpenses,
      currentAmount
    )

    res.json({
      id: emergencyFund.id,
      userId: emergencyFund.userId,
      goal: {
        targetAmount: emergencyFund.goal.targetAmount,
        monthsCoverage: emergencyFund.goal.monthsCoverage,
        monthlyExpenses: emergencyFund.goal.monthlyExpenses,
      },
      currentAmount: emergencyFund.currentAmount,
      progress: emergencyFund.getProgressPercentage(),
      remaining: emergencyFund.getRemaining(),
      isGoalMet: emergencyFund.isGoalMet(),
      health: emergencyFund.getHealth(),
    })
  } catch (error: any) {
    logger.error('Error setting emergency fund goal:', error)
    res.status(500).json({ error: error.message || 'Failed to set emergency fund goal' })
  }
})

/**
 * PUT /api/products/emergency-fund/progress
 * Update emergency fund progress
 */
router.put('/emergency-fund/progress', async (req: Request, res: Response) => {
  try {
    // TODO: Extract userId from authentication token
    const userId = req.body.userId || 'demo-user-id' // Temporary for development

    const { amount, notes } = req.body

    if (amount === undefined) {
      return res.status(400).json({ error: 'amount is required' })
    }

    const emergencyFund = await updateProgressUseCase.execute(userId, amount, notes)

    res.json({
      id: emergencyFund.id,
      userId: emergencyFund.userId,
      goal: {
        targetAmount: emergencyFund.goal.targetAmount,
        monthsCoverage: emergencyFund.goal.monthsCoverage,
        monthlyExpenses: emergencyFund.goal.monthlyExpenses,
      },
      currentAmount: emergencyFund.currentAmount,
      progress: emergencyFund.getProgressPercentage(),
      remaining: emergencyFund.getRemaining(),
      isGoalMet: emergencyFund.isGoalMet(),
      health: emergencyFund.getHealth(),
      progressHistory: emergencyFund.progressHistory,
    })
  } catch (error: any) {
    logger.error('Error updating emergency fund progress:', error)
    res.status(500).json({ error: error.message || 'Failed to update emergency fund progress' })
  }
})

/**
 * GET /api/products/emergency-fund/status
 * Get emergency fund status
 */
router.get('/emergency-fund/status', async (req: Request, res: Response) => {
  try {
    // TODO: Extract userId from authentication token
    const userId = req.query.userId as string || 'demo-user-id' // Temporary for development

    const status = await getStatusUseCase.execute(userId)

    if (!status.emergencyFund) {
      return res.json({
        exists: false,
        message: 'Emergency fund goal not set yet',
      })
    }

    res.json({
      exists: true,
      emergencyFund: {
        id: status.emergencyFund.id,
        userId: status.emergencyFund.userId,
        goal: {
          targetAmount: status.emergencyFund.goal.targetAmount,
          monthsCoverage: status.emergencyFund.goal.monthsCoverage,
          monthlyExpenses: status.emergencyFund.goal.monthlyExpenses,
        },
        currentAmount: status.emergencyFund.currentAmount,
        progressHistory: status.emergencyFund.progressHistory,
      },
      health: status.health ? {
        status: status.health.status,
        monthsCovered: status.health.monthsCovered,
        recommendedMonths: status.health.recommendedMonths,
        recommendations: status.health.recommendations,
        colorCode: status.health.getColorCode(),
      } : null,
      progress: status.progress,
      remaining: status.remaining,
      isGoalMet: status.isGoalMet,
    })
  } catch (error: any) {
    logger.error('Error getting emergency fund status:', error)
    res.status(500).json({ error: error.message || 'Failed to get emergency fund status' })
  }
})

/**
 * POST /api/products/emergency-fund/calculate
 * Calculate required emergency fund amount (legacy, simple version)
 */
router.post('/emergency-fund/calculate', async (req: Request, res: Response) => {
  try {
    const { monthlyExpenses, monthsCoverage = 6 } = req.body

    if (!monthlyExpenses || monthlyExpenses <= 0) {
      return res.status(400).json({ error: 'monthlyExpenses must be greater than 0' })
    }

    const requiredAmount = await calculateRequiredUseCase.execute(monthlyExpenses, monthsCoverage)

    res.json({
      monthlyExpenses,
      monthsCoverage,
      requiredAmount,
      recommendations: [
        `For ${monthsCoverage} months of coverage, you need $${requiredAmount.toFixed(2)}`,
        'Most financial experts recommend 3-6 months of expenses',
        'Consider your job stability and financial obligations when choosing coverage',
      ],
    })
  } catch (error: any) {
    logger.error('Error calculating emergency fund:', error)
    res.status(500).json({ error: error.message || 'Failed to calculate emergency fund' })
  }
})

/**
 * POST /api/products/emergency-fund/calculate-with-risk-profile
 * Calculate emergency fund as a decision clarifier with risk profile analysis
 */
router.post('/emergency-fund/calculate-with-risk-profile', async (req: Request, res: Response) => {
  try {
    const {
      employmentType,
      jobSecurity,
      incomeStructure,
      numberOfDependents,
      isSoleEarner,
      riskTolerance,
      numberOfIncomeSources,
      monthlyEssentialExpenses,
      currentEmergencySavings,
      liquidityType,
      monthlySurplus,
    } = req.body

    // Validation
    if (!monthlyEssentialExpenses || monthlyEssentialExpenses <= 0) {
      return res.status(400).json({ error: 'monthlyEssentialExpenses must be greater than 0' })
    }

    if (currentEmergencySavings === undefined || currentEmergencySavings < 0) {
      return res.status(400).json({ error: 'currentEmergencySavings must be >= 0' })
    }

    // Validate enums
    if (!Object.values(EmploymentType).includes(employmentType)) {
      return res.status(400).json({ error: 'Invalid employmentType' })
    }
    if (!Object.values(JobSecurity).includes(jobSecurity)) {
      return res.status(400).json({ error: 'Invalid jobSecurity' })
    }
    if (!Object.values(RiskTolerance).includes(riskTolerance)) {
      return res.status(400).json({ error: 'Invalid riskTolerance' })
    }
    if (!Object.values(IncomeStructure).includes(incomeStructure)) {
      return res.status(400).json({ error: 'Invalid incomeStructure' })
    }

    const result = await calculateWithRiskProfileUseCase.execute({
      employmentType,
      jobSecurity,
      incomeStructure,
      numberOfDependents: numberOfDependents || 0,
      isSoleEarner: isSoleEarner || false,
      riskTolerance,
      numberOfIncomeSources: numberOfIncomeSources || 1,
      monthlyEssentialExpenses,
      currentEmergencySavings: currentEmergencySavings || 0,
      liquidityType: liquidityType || 'INSTANT',
    })

    // Add action plan if monthly surplus provided
    if (monthlySurplus && monthlySurplus > 0) {
      const actionPlan = calculateWithRiskProfileUseCase.calculateActionPlan(
        result.targetAmount,
        currentEmergencySavings || 0,
        monthlySurplus
      )
      if (actionPlan) {
        result.recommendedMonthlyContribution = actionPlan.recommendedMonthlyContribution
        result.estimatedMonthsToTarget = actionPlan.estimatedMonthsToTarget
      }
    }

    res.json(result)
  } catch (error: any) {
    logger.error('Error calculating emergency fund with risk profile:', error)
    res.status(500).json({ error: error.message || 'Failed to calculate emergency fund' })
  }
})

export default router

