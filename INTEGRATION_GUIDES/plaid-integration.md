# Plaid Integration Guide

## Overview

Plaid provides account aggregation services that allow users to link their bank and investment accounts automatically. This integration unlocks automatic portfolio tracking and real-time balance updates.

## Features Unlocked

- ✅ Automatic account syncing (no manual entry)
- ✅ Multi-account portfolio view
- ✅ Real-time balance updates
- ✅ Transaction history import
- ✅ Account verification

## Setup

### 1. Get Plaid API Keys

1. Sign up at [Plaid Dashboard](https://dashboard.plaid.com/)
2. Create a new application
3. Get your `PLAID_CLIENT_ID` and `PLAID_SECRET`
4. Choose your environment (sandbox for development, production for live)

### 2. Install Plaid SDK

```bash
npm install plaid
```

### 3. Environment Variables

Add to `.env`:
```
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # or 'production'
```

### 4. Create Plaid Service

Create `apps/backend/src/integrations/plaidService.ts`:

```typescript
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

export async function createLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Life World OS',
    products: ['transactions', 'investments'],
    country_codes: ['US'],
    language: 'en',
  })
  return response.data.link_token
}

export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  })
  return response.data
}

export async function getAccounts(accessToken: string) {
  const response = await plaidClient.accountsGet({
    access_token: accessToken,
  })
  return response.data.accounts
}

export async function getInvestmentHoldings(accessToken: string) {
  const response = await plaidClient.investmentsHoldingsGet({
    access_token: accessToken,
  })
  return response.data
}
```

## API Endpoints

### POST /api/integrations/plaid/create-link-token
Creates a Plaid Link token for the frontend.

### POST /api/integrations/plaid/exchange-token
Exchanges public token for access token.

### GET /api/integrations/plaid/accounts
Gets linked accounts.

## Frontend Integration

### Install Plaid Link

```bash
npm install react-plaid-link
```

### Create PlaidLinkButton Component

```typescript
import { usePlaidLink } from 'react-plaid-link'
import { portfolioRebalancingApi } from '../services/api'

export function PlaidLinkButton() {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      await portfolioRebalancingApi.exchangePlaidToken(publicToken)
    },
  })

  return (
    <button onClick={() => open()} disabled={!ready}>
      Link Account
    </button>
  )
}
```

## Best Practices

1. **Store Access Tokens Securely**: Encrypt access tokens in the database
2. **Handle Webhooks**: Set up webhooks for account updates
3. **Error Handling**: Handle Plaid errors gracefully
4. **Rate Limits**: Respect Plaid rate limits (200 requests/minute)
5. **User Consent**: Always get explicit user consent before linking accounts

## Troubleshooting

- **Link Token Expired**: Link tokens expire after 4 hours, create a new one
- **Invalid Credentials**: Check your Plaid API keys
- **Account Not Found**: User may need to re-link account
- **Rate Limit Exceeded**: Implement request queuing


