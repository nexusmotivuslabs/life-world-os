# Brokerage API Integration Guide

## Overview

Brokerage API integration enables automated trade execution, transforming the system from recommendations to full robo-advisor functionality.

## Features Unlocked

- ✅ One-click rebalancing execution
- ✅ Automated trade placement
- ✅ Order confirmation tracking
- ✅ Trade history and audit trail
- ✅ Full robo-advisor functionality

## Supported Brokerages

### Interactive Brokers (IBKR)

**Setup:**
1. Sign up for IBKR API access
2. Get API credentials
3. Use IBKR TWS or IB Gateway

**Documentation:** [IBKR API Docs](https://interactivebrokers.github.io/tws-api/)

### TD Ameritrade / Charles Schwab

**Setup:**
1. Register for API access
2. Get OAuth credentials
3. Implement OAuth flow

**Documentation:** [TD Ameritrade API](https://developer.tdameritrade.com/)

### Alpaca (Recommended for Development)

**Setup:**
1. Sign up at [Alpaca](https://alpaca.markets/)
2. Get API key and secret
3. Paper trading available for testing

**Example:**
```typescript
// apps/backend/src/integrations/brokerageService.ts
import { AlpacaClient } from '@master-chief/alpaca'

const client = new AlpacaClient({
  credentials: {
    key: process.env.ALPACA_API_KEY!,
    secret: process.env.ALPACA_SECRET!,
    paper: true, // Use paper trading for testing
  },
})

export async function executeRebalancingTrade(
  userId: string,
  symbol: string,
  quantity: number,
  side: 'buy' | 'sell'
) {
  const order = await client.createOrder({
    symbol,
    qty: quantity,
    side,
    type: 'market',
    time_in_force: 'day',
  })
  return order
}
```

## Implementation

### 1. Create Brokerage Service

Create `apps/backend/src/integrations/brokerageService.ts`:

```typescript
export interface BrokerageProvider {
  executeTrade(symbol: string, quantity: number, side: 'buy' | 'sell'): Promise<TradeResult>
  getAccountBalance(): Promise<number>
  getPositions(): Promise<Position[]>
}

export class AlpacaProvider implements BrokerageProvider {
  // Implementation
}

export async function executeRebalancingPlan(
  userId: string,
  recommendations: RebalancingRecommendation[]
) {
  // Execute trades based on recommendations
  for (const rec of recommendations) {
    if (rec.action === 'buy' || rec.action === 'contribute') {
      await executeBuyOrder(userId, rec)
    } else if (rec.action === 'sell') {
      await executeSellOrder(userId, rec)
    }
  }
}
```

### 2. Security Considerations

1. **OAuth Flow**: Use OAuth for user authentication
2. **Token Storage**: Encrypt brokerage access tokens
3. **Trade Confirmation**: Require user confirmation for trades
4. **Audit Logging**: Log all trade executions
5. **Rate Limits**: Respect brokerage rate limits

## Best Practices

1. **Paper Trading**: Test with paper trading first
2. **Trade Limits**: Set daily trade limits
3. **Error Handling**: Handle trade failures gracefully
4. **Confirmation**: Require user confirmation for large trades
5. **Compliance**: Ensure compliance with financial regulations

## Troubleshooting

- **Authentication Failed**: Check OAuth tokens
- **Insufficient Funds**: Check account balance before trading
- **Market Closed**: Handle market hours
- **Order Rejected**: Log rejection reasons





