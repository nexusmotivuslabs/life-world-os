# Investment System Documentation

## Overview

The Investment System allows users to allocate their Gold across different investment types (Crypto, Stocks, Cash, High-Yield Savings) to grow their wealth while earning XP. Each investment type has different risk/reward profiles and XP distributions.

## Investment Types

### 1. Cryptocurrency (₿)
- **Risk Level:** High
- **Expected Yield:** Variable (0% default - user sets)
- **XP Distribution:** 50% Engines, 25% Optionality, 10% each Capacity/Oxygen, 5% Meaning
- **Best For:** High-risk, high-reward growth, building optionality
- **Recommended Allocation:** 5-15% of portfolio

### 2. Stocks (📈)
- **Risk Level:** Medium-High
- **Expected Yield:** 7.0% (historical S&P 500 average)
- **XP Distribution:** 45% Engines, 25% Oxygen, 15% Capacity, 10% Optionality, 5% Meaning
- **Best For:** Balanced long-term growth
- **Recommended Allocation:** 50-70% of portfolio

### 3. Cash (💵)
- **Risk Level:** Low
- **Expected Yield:** 0% (no yield on cash)
- **XP Distribution:** 50% Oxygen, 20% Capacity, 10% each Engines/Meaning/Optionality
- **Best For:** Liquidity and safety
- **Recommended Allocation:** 5-10% of portfolio

### 4. High-Yield Savings (🏦)
- **Risk Level:** Low
- **Expected Yield:** 4.5% (current high-yield savings rate)
- **XP Distribution:** 40% Oxygen, 30% Engines, 15% Capacity, 10% Optionality, 5% Meaning
- **Best For:** Safe growth, emergency fund building
- **Recommended Allocation:** 20-30% of portfolio

## XP Calculation

XP rewards scale logarithmically with investment amount:
- **Formula:** `baseXP = 10 * log10(amount/10) + 10`
- **Examples:**
  - $100 investment = ~10 XP
  - $1,000 investment = ~50 XP
  - $10,000 investment = ~150 XP

Category XP is then distributed based on investment type percentages.

## Features

### Investment Management
- **Create Investments:** Allocate gold to different investment types
- **Track Performance:** Monitor current value, total return, and ROI
- **Update Investments:** Add more money, update expected yield, or adjust current value
- **Sell/Withdraw:** Liquidate investments and return gold to portfolio

### Portfolio Tracking
- **Total Invested:** Sum of all investment amounts
- **Current Value:** Total market value of all investments
- **Total Return:** Combined gains/losses across all investments
- **Allocation by Type:** Visual breakdown of portfolio distribution

### Growth System
- **Monthly Growth Processing:** Investments with yields automatically grow monthly
- **Compound Interest:** Growth compounds based on expected yield
- **Automatic Updates:** Current value and total return update automatically

## Database Schema

### Investment Model
```prisma
model Investment {
  id            String          @id @default(uuid())
  userId        String
  type          InvestmentType
  name          String          // e.g., "Bitcoin", "S&P 500 Index"
  description   String?
  amount        Decimal         // Current invested amount
  initialAmount Decimal         // Original investment
  expectedYield Decimal         // Annual yield percentage
  currentValue  Decimal         // Current market value
  totalReturn   Decimal         // Total gains/losses
  lastUpdated   DateTime
  createdAt     DateTime
}
```

## API Endpoints

### GET /api/investments
Get all investments for the authenticated user.

**Response:**
```json
{
  "investments": [...],
  "totalsByType": {
    "CRYPTO": 5000,
    "STOCKS": 20000,
    "CASH": 1000,
    "HIGH_YIELD_SAVINGS": 5000
  },
  "totalInvested": 31000,
  "totalValue": 32500,
  "totalReturn": 1500
}
```

### POST /api/investments
Create a new investment.

**Request Body:**
```json
{
  "type": "STOCKS",
  "name": "S&P 500 Index Fund",
  "description": "Diversified stock market investment",
  "amount": 5000,
  "expectedYield": 7.0
}
```

**Response:**
```json
{
  "success": true,
  "xpGained": {
    "overall": 50,
    "category": {
      "capacity": 7,
      "engines": 22,
      "oxygen": 12,
      "meaning": 2,
      "optionality": 5
    }
  },
  "investments": [...],
  "milestones": {...}
}
```

### PUT /api/investments/:id
Update an investment (add more money, update yield, etc.).

**Request Body:**
```json
{
  "amount": 6000,
  "expectedYield": 7.5,
  "currentValue": 6500
}
```

### DELETE /api/investments/:id
Sell/withdraw an investment.

**Response:**
```json
{
  "success": true,
  "returnedGold": 6500,
  "totalReturn": 1500,
  "message": "Investment sold/withdrawn"
}
```

### POST /api/investments/process-growth
Process monthly growth for all investments (typically called by a scheduled job).

**Response:**
```json
{
  "success": true,
  "totalGrowth": 125.50,
  "message": "Monthly growth processed"
}
```

## Usage Flow

1. **View Portfolio:** See all investments, totals, and allocation
2. **Create Investment:** Click "New Investment" and select type
3. **Allocate Gold:** Enter amount (must have sufficient gold)
4. **Earn XP:** XP is automatically awarded based on investment type and amount
5. **Track Growth:** Monitor performance over time
6. **Reallocate:** Add more to existing investments or create new ones
7. **Sell/Withdraw:** Liquidate investments when needed

## XP Distribution by Type

| Type | Capacity | Engines | Oxygen | Meaning | Optionality |
|------|----------|---------|--------|---------|-------------|
| Crypto | 10% | 50% | 10% | 5% | 25% |
| Stocks | 15% | 45% | 25% | 5% | 10% |
| Cash | 20% | 10% | 50% | 10% | 10% |
| High-Yield Savings | 15% | 30% | 40% | 5% | 10% |

## Recommended Portfolio Allocation

For balanced growth and risk management:
- **Stocks:** 50-70% (main growth engine)
- **High-Yield Savings:** 20-30% (safe growth)
- **Crypto:** 5-15% (optionality and high growth potential)
- **Cash:** 5-10% (liquidity and safety)

## Integration with Game Systems

- **Gold Resource:** Investments deduct from available gold
- **XP System:** Each investment awards XP to relevant categories
- **Activity Logs:** Investments are logged as activities
- **Milestones:** Large investments may trigger milestones
- **Engines:** Investments can be tracked as income-generating engines

## Setup

1. Run database migration:
```bash
cd apps/backend
npx prisma migrate dev --name add_investment_system
```

2. Start backend and frontend - the system is ready to use!

## Portfolio Rebalancing System

The Investment System integrates with the **Portfolio & Life Rebalancing System** for long-term, durable portfolio management.

### Features
- **Target Allocation Configuration**: Set target allocations for Stocks vs Bonds
- **Drift Detection**: Automatically detect when portfolio drifts from target
- **Smart Recommendations**: Get rebalancing recommendations that prefer contributions over selling
- **Investment Philosophy**: Capture your long-term investment philosophy to prevent emotional decisions

### API Endpoints
- `GET /api/portfolio-rebalancing/config` - Get user's rebalancing configuration
- `POST /api/portfolio-rebalancing/config` - Create or update configuration
- `GET /api/portfolio-rebalancing/status` - Get current allocation vs target
- `GET /api/portfolio-rebalancing/recommendations` - Get rebalancing recommendations

### Mapping Strategy
- **Stocks** = `STOCKS` investment type
- **Bonds** = `HIGH_YIELD_SAVINGS` + `CASH` combined

See [Portfolio Rebalancing System Documentation](./PORTFOLIO_REBALANCING_ECOSYSTEM.md) for full details.

## Integration Ecosystem

The Investment System can be extended with external integrations to unlock major features:

### Account Aggregation
- **Plaid Integration**: Automatic account syncing, real-time balance updates
- See [Plaid Integration Guide](./INTEGRATION_GUIDES/plaid-integration.md)

### Market Data
- **Market Data APIs**: Real-time portfolio valuation, automatic price updates
- See [Market Data Integration Guide](./INTEGRATION_GUIDES/market-data-integration.md)

### Brokerage APIs
- **Automated Execution**: One-click rebalancing, automated trade placement
- See [Brokerage API Integration Guide](./INTEGRATION_GUIDES/brokerage-api-integration.md)

### Tax Optimization
- **Tax-Aware Rebalancing**: Tax-loss harvesting, tax-optimized rebalancing
- See [Tax Optimization Integration Guide](./INTEGRATION_GUIDES/tax-optimization-integration.md)

For a comprehensive overview of the ecosystem, integration patterns, and tool recommendations, see [Portfolio Rebalancing Ecosystem Guide](./PORTFOLIO_REBALANCING_ECOSYSTEM.md).

## Future Enhancements

- Automatic monthly growth processing (scheduled job)
- Investment performance charts and graphs
- Tax-advantaged account types (401k, IRA, etc.)
- Real-time market data integration (see integration guides)
- Investment goals and targets
- Automated rebalancing execution (see brokerage integration guide)

