/**
 * UpdatePortfolioRebalancingConfigUseCase
 * 
 * Updates an existing portfolio rebalancing configuration for a user.
 */

import { PrismaClient } from '@prisma/client'
import { PortfolioRebalancingService } from '../../domain/services/PortfolioRebalancingService.js'

export interface UpdateRebalancingConfigInput {
  userId: string
  timeHorizonYears?: number
  incomeStability?: 'HIGH' | 'MEDIUM' | 'LOW'
  emotionalTolerance?: 'LOW' | 'MEDIUM' | 'HIGH'
  decisionDiscipline?: 'LOW' | 'MEDIUM' | 'HIGH'
  targetStocksPercent?: number
  targetBondsPercent?: number
  rebalancingFrequency?: 'ANNUAL' | 'THRESHOLD_BASED'
  driftThreshold?: number
  preferContributions?: boolean
  bondPurpose?: string[]
}

export interface RebalancingConfigOutput {
  id: string
  userId: string
  timeHorizonYears: number
  incomeStability: 'HIGH' | 'MEDIUM' | 'LOW'
  emotionalTolerance: 'LOW' | 'MEDIUM' | 'HIGH'
  decisionDiscipline: 'LOW' | 'MEDIUM' | 'HIGH'
  targetStocksPercent: number
  targetBondsPercent: number
  rebalancingFrequency: 'ANNUAL' | 'THRESHOLD_BASED'
  driftThreshold: number
  preferContributions: boolean
  bondPurpose: string[]
  lastRebalancedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export class UpdatePortfolioRebalancingConfigUseCase {
  constructor(
    private prisma: PrismaClient,
    private rebalancingService: PortfolioRebalancingService
  ) {}

  async execute(input: UpdateRebalancingConfigInput): Promise<RebalancingConfigOutput> {
    // Get existing config
    const existing = await this.prisma.portfolioRebalancingConfig.findUnique({
      where: { userId: input.userId },
    })

    if (!existing) {
      throw new Error('Portfolio rebalancing config not found. Create it first.')
    }

    // If profile fields changed, recalculate allocation if not explicitly provided
    const profileChanged = 
      input.timeHorizonYears !== undefined ||
      input.incomeStability !== undefined ||
      input.emotionalTolerance !== undefined ||
      input.decisionDiscipline !== undefined

    let targetStocksPercent = input.targetStocksPercent
    let targetBondsPercent = input.targetBondsPercent

    if (profileChanged && (!targetStocksPercent || !targetBondsPercent)) {
      const recommended = this.rebalancingService.calculateRecommendedAllocation(
        input.timeHorizonYears ?? existing.timeHorizonYears,
        input.incomeStability ?? existing.incomeStability,
        input.emotionalTolerance ?? existing.emotionalTolerance,
        input.decisionDiscipline ?? existing.decisionDiscipline
      )
      targetStocksPercent = recommended.stocksPercent
      targetBondsPercent = recommended.bondsPercent
    } else if (targetStocksPercent !== undefined || targetBondsPercent !== undefined) {
      // If one is provided, calculate the other
      if (targetStocksPercent !== undefined) {
        targetBondsPercent = 100 - targetStocksPercent
      } else if (targetBondsPercent !== undefined) {
        targetStocksPercent = 100 - targetBondsPercent
      }
    } else {
      // Keep existing values
      targetStocksPercent = Number(existing.targetStocksPercent)
      targetBondsPercent = Number(existing.targetBondsPercent)
    }

    // Validate percentages sum to 100
    if (Math.abs(targetStocksPercent + targetBondsPercent - 100) > 0.01) {
      throw new Error('Target stocks and bonds percentages must sum to 100')
    }

    // Update config
    const config = await this.prisma.portfolioRebalancingConfig.update({
      where: { userId: input.userId },
      data: {
        ...(input.timeHorizonYears !== undefined && { timeHorizonYears: input.timeHorizonYears }),
        ...(input.incomeStability !== undefined && { incomeStability: input.incomeStability }),
        ...(input.emotionalTolerance !== undefined && { emotionalTolerance: input.emotionalTolerance }),
        ...(input.decisionDiscipline !== undefined && { decisionDiscipline: input.decisionDiscipline }),
        ...(targetStocksPercent !== undefined && { targetStocksPercent: targetStocksPercent }),
        ...(targetBondsPercent !== undefined && { targetBondsPercent: targetBondsPercent }),
        ...(input.rebalancingFrequency !== undefined && { rebalancingFrequency: input.rebalancingFrequency }),
        ...(input.driftThreshold !== undefined && { driftThreshold: input.driftThreshold }),
        ...(input.preferContributions !== undefined && { preferContributions: input.preferContributions }),
        ...(input.bondPurpose !== undefined && { bondPurpose: input.bondPurpose }),
      },
    })

    return {
      id: config.id,
      userId: config.userId,
      timeHorizonYears: config.timeHorizonYears,
      incomeStability: config.incomeStability as 'HIGH' | 'MEDIUM' | 'LOW',
      emotionalTolerance: config.emotionalTolerance as 'LOW' | 'MEDIUM' | 'HIGH',
      decisionDiscipline: config.decisionDiscipline as 'LOW' | 'MEDIUM' | 'HIGH',
      targetStocksPercent: Number(config.targetStocksPercent),
      targetBondsPercent: Number(config.targetBondsPercent),
      rebalancingFrequency: config.rebalancingFrequency as 'ANNUAL' | 'THRESHOLD_BASED',
      driftThreshold: Number(config.driftThreshold),
      preferContributions: config.preferContributions,
      bondPurpose: config.bondPurpose as string[],
      lastRebalancedAt: config.lastRebalancedAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }
  }
}


