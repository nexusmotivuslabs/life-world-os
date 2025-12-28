/**
 * GetRebalancingRecommendationsUseCase
 * 
 * Gets rebalancing recommendations for a user's portfolio.
 * This is essentially the same as GetPortfolioRebalancingStatusUseCase
 * but returns only the recommendations part.
 */

import { GetPortfolioRebalancingStatusUseCase } from './GetPortfolioRebalancingStatusUseCase.js'
import { RebalancingRecommendation } from '../../domain/services/PortfolioRebalancingService.js'

export class GetRebalancingRecommendationsUseCase {
  constructor(
    private getStatusUseCase: GetPortfolioRebalancingStatusUseCase
  ) {}

  async execute(
    userId: string,
    availableContributionAmount?: number
  ): Promise<RebalancingRecommendation[]> {
    const status = await this.getStatusUseCase.execute(userId, availableContributionAmount)
    
    if (!status) {
      return []
    }

    return status.recommendations
  }
}


