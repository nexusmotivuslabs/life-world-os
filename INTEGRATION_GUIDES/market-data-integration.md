# Market Data Integration Guide

## Overview

Market data integration provides real-time portfolio valuation and automatic price updates. This enables real-time monitoring and automatic rebalancing triggers.

## Features Unlocked

- ✅ Real-time portfolio valuation
- ✅ Automatic price updates
- ✅ Historical performance tracking
- ✅ Market-based drift detection
- ✅ Performance attribution analysis

## Recommended Providers

### Alpha Vantage (Free Tier)

**Setup:**
1. Get API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Free tier: 5 calls/minute, 500 calls/day

**Example:**
```typescript
// apps/backend/src/integrations/marketDataService.ts
export async function getStockPrice(symbol: string) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
  )
  const data = await response.json()
  return parseFloat(data['Global Quote']['05. price'])
}
```

### IEX Cloud (Recommended for Production)

**Setup:**
1. Sign up at [IEX Cloud](https://iexcloud.io/)
2. Get API token
3. Free tier: 50,000 messages/month

**Example:**
```typescript
export async function getStockPrice(symbol: string) {
  const response = await fetch(
    `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${process.env.IEX_CLOUD_API_TOKEN}`
  )
  const data = await response.json()
  return data.latestPrice
}
```

## Implementation

### 1. Create Market Data Service

Create `apps/backend/src/integrations/marketDataService.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface MarketDataProvider {
  getPrice(symbol: string): Promise<number>
  getHistoricalPrices(symbol: string, days: number): Promise<number[]>
}

export class AlphaVantageProvider implements MarketDataProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getPrice(symbol: string): Promise<number> {
    // Implementation
  }

  async getHistoricalPrices(symbol: string, days: number): Promise<number[]> {
    // Implementation
  }
}

export async function updateInvestmentPrices(userId: string) {
  const investments = await prisma.investment.findMany({
    where: { userId },
  })

  // Update prices based on investment type
  for (const investment of investments) {
    if (investment.type === 'STOCKS') {
      // Get stock price
      const price = await getStockPrice(investment.name)
      await prisma.investment.update({
        where: { id: investment.id },
        data: { currentValue: price },
      })
    }
  }
}
```

### 2. Scheduled Job

Create a cron job to update prices:

```typescript
// apps/backend/src/jobs/updateMarketPrices.ts
import cron from 'node-cron'
import { updateInvestmentPrices } from '../integrations/marketDataService'

// Update prices every hour during market hours
cron.schedule('0 * * * *', async () => {
  // Get all users with investments
  const users = await prisma.user.findMany({
    where: {
      investments: {
        some: {},
      },
    },
  })

  for (const user of users) {
    await updateInvestmentPrices(user.id)
  }
})
```

## Best Practices

1. **Caching**: Cache prices to reduce API calls
2. **Rate Limits**: Respect provider rate limits
3. **Error Handling**: Handle API failures gracefully
4. **Market Hours**: Only update during market hours
5. **Fallback**: Have fallback providers if primary fails

## Troubleshooting

- **API Key Invalid**: Check API key configuration
- **Rate Limit Exceeded**: Implement caching or upgrade plan
- **Symbol Not Found**: Handle invalid symbols gracefully
- **Network Errors**: Implement retry logic


