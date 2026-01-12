/**
 * GetPortfolioRebalancingStatusUseCase
 * 
 * Gets the current rebalancing status for a user's portfolio.
 */

import { PrismaClient } from '@prisma/client'
import { PortfolioRebalancingService, RebalancingStatus } from '../../domain/services/PortfolioRebalancingService.js'
import { PortfolioHolding } from '../../domain/services/PortfolioAnalyzerService.js'

export class GetPortfolioRebalancingStatusUseCase {
  constructor(
    private prisma: PrismaClient,
    private rebalancingService: PortfolioRebalancingService
  ) {}

  async execute(
    userId: string,
    availableContributionAmount?: number
  ): Promise<RebalancingStatus | null> {
    // Get user's config
    const config = await this.prisma.portfolioRebalancingConfig.findUnique({
      where: { userId },
    })

    if (!config) {
      return null
    }

    // Get user's investments
    const investments = await this.prisma.investment.findMany({
      where: { userId },
    })

    // Convert to PortfolioHolding format
    const holdings: PortfolioHolding[] = investments.map(inv => ({
      id: inv.id,
      name: inv.name,
      type: inv.type,
      amount: Number(inv.amount),
      currentValue: Number(inv.currentValue),
      expectedYield: Number(inv.expectedYield),
    }))

    // Get available contribution amount from resources if not provided
    let contributionAmount = availableContributionAmount
    if (contributionAmount === undefined) {
      const resources = await this.prisma.resources.findUnique({
        where: { userId },
      })
      contributionAmount = resources ? Number(resources.gold) : 0
    }

    // Get status
    const { Money } = await import('../../domain/valueObjects/Money.js')
    const status = this.rebalancingService.getRebalancingStatus(
      holdings,
      {
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
      },
      contributionAmount ? Money.create(contributionAmount) : undefined
    )

    return status
  }
}





