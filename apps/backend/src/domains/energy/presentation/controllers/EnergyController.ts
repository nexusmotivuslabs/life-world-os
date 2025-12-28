/**
 * EnergyController
 * 
 * Presentation layer controller for energy-related endpoints.
 * Provides energy status, boosts, and management.
 */

import { Router, Request, Response } from 'express'
import { PrismaClient, BoostType } from '@prisma/client'
import { PrismaEnergyBoostRepositoryAdapter } from '../../infrastructure/adapters/database/PrismaEnergyBoostRepositoryAdapter.js'
import { UserEnergyContextAdapter } from '../../infrastructure/adapters/userContext/UserEnergyContextAdapter.js'
import {
  CreateEnergyBoostUseCase,
  GetActiveBoostsUseCase,
  CleanupExpiredBoostsUseCase,
} from '../../application/useCases/EnergyBoostUseCases.js'
import { prisma } from '../../../../lib/prisma.js'
import { authenticateToken, AuthRequest } from '../../../../middleware/auth.js'
import { getLiveEnergy } from '../../../../services/energyBurndownService.js'

const router = Router()

// Initialize adapters and use cases
const boostRepository = new PrismaEnergyBoostRepositoryAdapter(prisma)
const userContext = new UserEnergyContextAdapter(prisma)

const createBoostUseCase = new CreateEnergyBoostUseCase(boostRepository)
const getActiveBoostsUseCase = new GetActiveBoostsUseCase(boostRepository)
const cleanupExpiredBoostsUseCase = new CleanupExpiredBoostsUseCase(boostRepository)

/**
 * GET /api/energy/status
 * Get current energy status for the authenticated user (with live burndown)
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const context = await userContext.getUserEnergyContext(userId)
    const activeBoosts = await getActiveBoostsUseCase.execute(userId)
    
    // Get live energy with burndown info
    const liveEnergy = await getLiveEnergy(userId)

    // Calculate total usable energy
    const boostAmounts = activeBoosts.map(boost => boost.getCurrentAmount())
    const totalUsable = context.baseEnergy + boostAmounts.reduce((sum, amount) => sum + amount, 0)
    const cappedTotal = Math.min(totalUsable, context.capacityCap)

    res.json({
      baseEnergy: context.baseEnergy, // Live energy (after burndown)
      restoredEnergy: liveEnergy.restoredEnergy, // Original restored amount
      capacity: context.capacity,
      capacityCap: context.capacityCap,
      isInBurnout: context.isInBurnout,
      temporaryBoosts: activeBoosts.map(boost => ({
        id: boost.id,
        type: boost.type,
        amount: boost.getCurrentAmount(),
        duration: boost.duration,
        expiresAt: boost.expiresAt,
        timeUntilExpiry: boost.getTimeUntilExpiry(),
        isActive: boost.isActive(),
      })),
      totalUsable: cappedTotal,
      baseEnergyPercentage: context.capacityCap > 0 
        ? (context.baseEnergy / context.capacityCap) * 100 
        : 0,
      // Burndown information
      burndown: liveEnergy.burndown ? {
        energyDecayed: liveEnergy.burndown.energyDecayed,
        hoursElapsed: liveEnergy.burndown.hoursElapsed,
        decayRatePerHour: liveEnergy.burndown.decayRatePerHour,
        hoursUntilDepletion: liveEnergy.burndown.hoursUntilDepletion,
        depletedAt: liveEnergy.burndown.depletedAt,
      } : null,
      restoredAt: liveEnergy.restoredAt,
    })
  } catch (error: any) {
    console.error('Error getting energy status:', error)
    res.status(500).json({ error: error.message || 'Failed to get energy status' })
  }
})

/**
 * POST /api/energy/boosts
 * Create a temporary energy boost
 */
router.post('/boosts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { type, amount, duration, decayRate } = req.body

    if (!type || !amount || !duration || decayRate === undefined) {
      return res.status(400).json({
        error: 'type, amount, duration, and decayRate are required',
      })
    }

    if (!Object.values(BoostType).includes(type)) {
      return res.status(400).json({ error: 'Invalid boost type' })
    }

    if (amount < 0 || duration < 0 || decayRate < 0) {
      return res.status(400).json({
        error: 'amount, duration, and decayRate must be non-negative',
      })
    }

    const boost = await createBoostUseCase.execute(
      userId,
      type,
      amount,
      duration,
      decayRate
    )

    res.json({
      id: boost.id,
      userId: boost.userId,
      type: boost.type,
      amount: boost.amount,
      duration: boost.duration,
      decayRate: boost.decayRate,
      expiresAt: boost.expiresAt,
      timeUntilExpiry: boost.getTimeUntilExpiry(),
      createdAt: boost.createdAt,
    })
  } catch (error: any) {
    console.error('Error creating energy boost:', error)
    res.status(500).json({ error: error.message || 'Failed to create energy boost' })
  }
})

/**
 * GET /api/energy/boosts
 * Get active energy boosts for the authenticated user
 */
router.get('/boosts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const boosts = await getActiveBoostsUseCase.execute(userId)

    res.json({
      boosts: boosts.map(boost => ({
        id: boost.id,
        type: boost.type,
        amount: boost.getCurrentAmount(),
        duration: boost.duration,
        decayRate: boost.decayRate,
        expiresAt: boost.expiresAt,
        timeUntilExpiry: boost.getTimeUntilExpiry(),
        isActive: boost.isActive(),
        createdAt: boost.createdAt,
      })),
      count: boosts.length,
    })
  } catch (error: any) {
    console.error('Error getting energy boosts:', error)
    res.status(500).json({ error: error.message || 'Failed to get energy boosts' })
  }
})

/**
 * POST /api/energy/boosts/cleanup
 * Clean up expired energy boosts
 */
router.post('/boosts/cleanup', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const deletedCount = await cleanupExpiredBoostsUseCase.execute(userId)

    res.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} expired energy boost(s)`,
    })
  } catch (error: any) {
    console.error('Error cleaning up energy boosts:', error)
    res.status(500).json({ error: error.message || 'Failed to clean up energy boosts' })
  }
})

export default router

