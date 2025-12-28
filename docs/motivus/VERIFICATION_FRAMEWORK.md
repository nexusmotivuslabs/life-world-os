# Verification Framework

## Overview

The verification framework combines **local knowledge** (app data) with **root knowledge** (external APIs) to provide verified truth, similar to how Ebony Maw combines local and root knowledge for Thanos.

## Architecture

### Knowledge Sources

1. **Local Knowledge**
   - Database records (Prisma models)
   - User state (Zustand store)
   - System configurations
   - Historical data
   - Calculated values

2. **Root Knowledge (External APIs)**
   - Real-time market data
   - Public APIs
   - Third-party services
   - Internet-based verification

3. **Combined Verification**
   - Local + Root = Verified truth
   - Cross-validation between sources
   - Confidence scoring

## Verification Types

### Financial Verification
- **Local**: User's recorded balances, transactions
- **Root**: Real-time market prices, exchange rates
- **Combined**: Verified portfolio value, accurate ROI calculations

### Location Verification
- **Local**: Saved locations, user preferences
- **Root**: Google Places API, real-time location data
- **Combined**: Verified location details, current status

### Health Verification
- **Local**: User's health metrics, capacity data
- **Root**: Fitness APIs, health standards
- **Combined**: Verified health status, recommendations

## Integration Points

### Documented for Future Integration

1. **Financial APIs**
   - Plaid (bank account verification)
   - Brokerage APIs (portfolio verification)
   - Market data APIs (real-time pricing)

2. **Location APIs**
   - Google Places API (location verification)
   - Geocoding services (address verification)

3. **Health APIs**
   - Fitness trackers (activity verification)
   - Health standards (benchmark verification)

4. **Identity APIs**
   - OAuth providers (identity verification)
   - SSO services (authentication verification)

## Implementation Pattern

```typescript
interface VerificationResult<T> {
  localData: T
  rootData: T | null
  verified: boolean
  confidence: number // 0-1
  timestamp: Date
  sources: string[]
}

async function verifyData<T>(
  localData: T,
  rootSource: () => Promise<T>
): Promise<VerificationResult<T>> {
  // Fetch root knowledge
  const rootData = await rootSource()
  
  // Compare and verify
  const verified = compareData(localData, rootData)
  const confidence = calculateConfidence(localData, rootData)
  
  return {
    localData,
    rootData,
    verified,
    confidence,
    timestamp: new Date(),
    sources: ['local', 'root']
  }
}
```

## Usage in Navigation

The verification framework is used by the Choose Plane assistant to:
- Verify user's current state
- Cross-reference app data with external sources
- Provide contextual guidance based on verified truth
- Ensure navigation decisions are based on accurate data


