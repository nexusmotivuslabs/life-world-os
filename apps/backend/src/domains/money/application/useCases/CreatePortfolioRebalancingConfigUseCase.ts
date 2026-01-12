/**
 * CreatePortfolioRebalancingConfigUseCase
 * 
 * Creates a new portfolio rebalancing configuration for a user.
 */

import { PrismaClient } from '@prisma/client'
import { PortfolioRebalancingService } from '../../domain/services/PortfolioRebalancingService.js'

export interface CreateRebalancingConfigInput {
  userId: string
  timeHorizonYears: number
  incomeStability: 'HIGH' | 'MEDIUM' | 'LOW'
  emotionalTolerance: 'LOW' | 'MEDIUM' | 'HIGH'
  decisionDiscipline: 'LOW' | 'MEDIUM' | 'HIGH'
  targetStocksPercent?: number // Optional - will be calculated if not provided
  targetBondsPercent?: number // Optional - will be calculated if not provided
  rebalancingFrequency: 'ANNUAL' | 'THRESHOLD_BASED'
  driftThreshold: number
  preferContributions: boolean
  bondPurpose: string[]
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

export class CreatePortfolioRebalancingConfigUseCase {
  constructor(
    private prisma: PrismaClient,
    private rebalancingService: PortfolioRebalancingService
  ) {}

  async execute(input: CreateRebalancingConfigInput): Promise<RebalancingConfigOutput> {
    // Calculate recommended allocation if not provided
    let targetStocksPercent = input.targetStocksPercent
    let targetBondsPercent = input.targetBondsPercent

    if (!targetStocksPercent || !targetBondsPercent) {
      const recommended = this.rebalancingService.calculateRecommendedAllocation(
        input.timeHorizonYears,
        input.incomeStability,
        input.emotionalTolerance,
        input.decisionDiscipline
      )
      targetStocksPercent = recommended.stocksPercent
      targetBondsPercent = recommended.bondsPercent
    }

    // Validate percentages sum to 100
    if (Math.abs(targetStocksPercent + targetBondsPercent - 100) > 0.01) {
      throw new Error('Target stocks and bonds percentages must sum to 100')
    }

    // Check if config already exists
    const existing = await this.prisma.portfolioRebalancingConfig.findUnique({
      where: { userId: input.userId },
    })

    if (existing) {
      throw new Error('Portfolio rebalancing config already exists for this user. Use update instead.')
    }

    // Create config
    const config = await this.prisma.portfolioRebalancingConfig.create({
      data: {
        userId: input.userId,
        timeHorizonYears: input.timeHorizonYears,
        incomeStability: input.incomeStability,
        emotionalTolerance: input.emotionalTolerance,
        decisionDiscipline: input.decisionDiscipline,
        targetStocksPercent: targetStocksPercent,
        targetBondsPercent: targetBondsPercent,
        rebalancingFrequency: input.rebalancingFrequency,
        driftThreshold: input.driftThreshold,
        preferContributions: input.preferContributions,
        bondPurpose: input.bondPurpose,
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





