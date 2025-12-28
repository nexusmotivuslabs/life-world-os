# Energy System Access Guide

## Current Access Points

### 1. Dashboard (Main View)

**Location:** `/dashboard`

Energy is currently displayed on the main dashboard:
- **Energy Card** - Shows current energy, usable energy, and capacity-modified cap
- **Resources Section** - Energy is included in the resources display
- **Energy is read-only** on the dashboard (managed through actions)

**Access:**
- Navigate to `/dashboard` after logging in
- Energy section appears near the top of the dashboard

### 2. API Endpoints

#### Get Energy Data
```bash
GET /api/resources
```
Returns:
```json
{
  "energy": 100,
  "usableEnergy": 85,
  "energyCap": 85,
  "isInBurnout": false,
  ...
}
```

#### Get Dashboard Data (includes energy)
```bash
GET /api/dashboard
```
Returns complete dashboard data including energy, resources, and stats.

### 3. Energy Laws (Bible Laws & 48 Laws of Power)

#### Get Energy Domain Power Laws
```bash
GET /api/power-laws?domain=ENERGY
```

#### Get Energy Domain Bible Laws
```bash
GET /api/bible-laws?domain=ENERGY
```

#### Get Specific Law
```bash
GET /api/power-laws/by-number/1?domain=ENERGY
GET /api/bible-laws/by-number/1?domain=ENERGY
```

## Frontend Access

### Current Implementation

Energy is accessed through:
1. **Dashboard Component** (`/dashboard`)
   - `EnergyCard` component displays energy
   - Shows base energy, usable energy, and capacity cap
   - Displays burnout status if applicable

2. **Resources API** (`/api/resources`)
   - Used by dashboard to fetch energy data
   - Includes energy calculations

### Recommended: Create Master Energy Page

Similar to how money has `/master-money`, you could create:

**Route:** `/master-energy`

**Features:**
- Base Energy visualization (Sun/Moon based on day/night)
- Sleep logging interface
- Energy laws (Bible Laws & 48 Laws of Power)
- Energy management tools
- Capacity tracking
- Burnout prevention
- Temporary boost management

## Quick Access Guide

### Via Dashboard
1. Log in to the app
2. Navigate to `/dashboard`
3. Find the "Energy" section near the top
4. View current energy, usable energy, and capacity cap

### Via API (for developers)
```bash
# Get energy data
curl http://localhost:3001/api/resources \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get energy domain laws
curl http://localhost:3001/api/power-laws?domain=ENERGY \
  -H "Authorization: Bearer YOUR_TOKEN"

curl http://localhost:3001/api/bible-laws?domain=ENERGY \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Via Frontend Code
```typescript
// In a React component
import { useGameStore } from '../store/useGameStore'

function MyComponent() {
  const { dashboard } = useGameStore()
  
  // Access energy data
  const energy = dashboard.resources.energy
  const usableEnergy = dashboard.resources.usableEnergy
  const energyCap = dashboard.resources.energyCap
  const isInBurnout = dashboard.isInBurnout
}
```

## Next Steps to Enhance Access

### 1. Create Master Energy Page

Create a dedicated page similar to `MasterMoney.tsx`:

**File:** `apps/frontend/src/pages/MasterEnergy.tsx`

**Features:**
- Base Energy visualization (Sun/Moon)
- Sleep logging
- Energy laws display
- Capacity management
- Energy planning tools

### 2. Add Route

**File:** `apps/frontend/src/App.tsx`

Add route:
```tsx
<Route path="/master-energy" element={<MasterEnergy />} />
```

### 3. Create Master Energy Card

**File:** `apps/frontend/src/components/MasterEnergyCard.tsx`

Similar to `MasterMoneyCard.tsx`, create a card that links to the Master Energy page.

### 4. Add to Dashboard

Add the Master Energy Card to the dashboard (similar to how MasterMoneyCard is displayed).

## Energy System Components

### Backend Services
- `energyService.ts` - Energy calculations and capacity modifiers
- `tickService.ts` - Daily energy reset and decay
- `burnoutService.ts` - Burnout detection and recovery

### Frontend Components
- `EnergyCard.tsx` - Current energy display
- Dashboard integration

### Data
- Energy laws (Power Laws & Bible Laws) - Available via API
- Energy data - Available via `/api/resources` and `/api/dashboard`

## Example: Accessing Energy Laws

```typescript
// Frontend example
import { bibleLawsApi, powerLawsApi } from './services/moneyApi'

// Get all energy domain Bible laws
const bibleLaws = await bibleLawsApi.getLawsByDomain('ENERGY')

// Get all energy domain Power laws
const powerLaws = await powerLawsApi.getLawsByDomain('ENERGY')

// Get specific law
const law = await powerLawsApi.getLawByNumber(1, 'ENERGY')
```

## Summary

**Current Access:**
- ✅ Dashboard (`/dashboard`) - View energy
- ✅ API endpoints - Get energy data and laws
- ✅ Energy Card component - Visual display

**Recommended Next Steps:**
- Create `/master-energy` page (similar to `/master-money`)
- Add Master Energy Card to dashboard
- Implement sleep logging interface
- Add energy management tools

