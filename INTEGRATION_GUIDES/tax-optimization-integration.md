# Tax Optimization Integration Guide

## Overview

Tax optimization integration enables tax-aware rebalancing and tax-loss harvesting, providing a major competitive advantage.

## Features Unlocked

- ✅ Tax-loss harvesting recommendations
- ✅ Tax-optimized rebalancing
- ✅ Real tax impact calculations
- ✅ Multi-account tax coordination
- ✅ Year-end tax planning

## Recommended Providers

### TaxJar

**Setup:**
1. Sign up at [TaxJar](https://www.taxjar.com/)
2. Get API token
3. Configure tax settings

**Example:**
```typescript
// apps/backend/src/integrations/taxCalculationService.ts
import Taxjar from 'taxjar'

const client = new Taxjar({
  apiKey: process.env.TAXJAR_API_KEY!,
})

export async function calculateTaxImpact(
  userId: string,
  trade: { symbol: string; quantity: number; price: number; side: 'buy' | 'sell' }
) {
  // Get user's tax bracket
  const userTaxInfo = await getUserTaxInfo(userId)
  
  // Calculate capital gains/losses
  const costBasis = await getCostBasis(userId, trade.symbol)
  const proceeds = trade.quantity * trade.price
  const gainOrLoss = proceeds - (costBasis * trade.quantity)
  
  // Calculate tax impact
  const taxImpact = gainOrLoss > 0 
    ? gainOrLoss * userTaxInfo.capitalGainsRate
    : 0 // Losses offset gains
  
  return {
    gainOrLoss,
    taxImpact,
    afterTaxProceeds: proceeds - taxImpact,
  }
}
```

## Implementation

### 1. Tax-Loss Harvesting

```typescript
export async function findTaxLossHarvestingOpportunities(
  userId: string,
  portfolio: PortfolioHolding[]
) {
  const opportunities = []
  
  for (const holding of portfolio) {
    if (holding.currentValue < holding.amount) {
      // Potential loss
      const loss = holding.amount - holding.currentValue
      const taxSavings = loss * 0.15 // Assume 15% capital gains rate
      
      opportunities.push({
        holding,
        loss,
        taxSavings,
        recommendation: 'Consider selling to harvest loss',
      })
    }
  }
  
  return opportunities
}
```

### 2. Tax-Aware Rebalancing

```typescript
export async function optimizeRebalancingForTaxes(
  userId: string,
  recommendations: RebalancingRecommendation[]
) {
  // Prioritize tax-loss harvesting
  const taxLossOpportunities = await findTaxLossHarvestingOpportunities(userId, portfolio)
  
  // Adjust recommendations to minimize tax impact
  const optimized = recommendations.map(rec => {
    if (rec.action === 'sell') {
      // Check if this creates a tax loss
      const taxImpact = await calculateTaxImpact(userId, {
        symbol: rec.assetClass,
        quantity: Math.abs(rec.adjustment),
        price: currentPrice,
        side: 'sell',
      })
      
      if (taxImpact.gainOrLoss < 0) {
        // This is a loss - prioritize it
        rec.priority = 'high'
        rec.taxBenefit = Math.abs(taxImpact.taxImpact)
      }
    }
    return rec
  })
  
  return optimized
}
```

## Best Practices

1. **Wash Sale Rules**: Avoid wash sales (30-day rule)
2. **Long-term vs Short-term**: Prefer long-term gains (lower tax rate)
3. **Tax Bracket**: Consider user's tax bracket
4. **Year-end Planning**: Optimize for year-end tax planning
5. **Multi-Account**: Coordinate across tax-advantaged and taxable accounts

## Troubleshooting

- **Tax Data Missing**: Prompt user to provide tax information
- **Calculation Errors**: Validate tax calculations
- **Compliance**: Ensure compliance with tax regulations
- **Wash Sale Detection**: Implement wash sale detection





