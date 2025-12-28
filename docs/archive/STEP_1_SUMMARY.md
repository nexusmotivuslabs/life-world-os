# Step 1 Implementation Summary

## Step 1: Introduce Energy as a First-Class Resource

**Status:** ✅ Complete

---

## Changes Made

### 1. Database Schema (`apps/backend/prisma/schema.prisma`)

- ✅ Added `energy` field to `Resources` model:
  - Type: `Int`
  - Default: `100`
  - Range: 0-110 (enforced by Capacity modifier logic)

- ✅ Added `lastTickAt` field to `User` model:
  - Type: `DateTime?` (nullable)
  - Tracks last daily tick for energy reset

### 2. Backend Services

**`apps/backend/src/services/energyService.ts`** (NEW)
- ✅ `calculateUsableEnergyCap(capacity)` - Calculates energy cap based on Capacity
- ✅ `getEffectiveEnergy(currentEnergy, capacity)` - Returns usable energy (capped)
- ✅ `BASE_DAILY_ENERGY` constant (100)
- ✅ `ACTION_ENERGY_COSTS` - Energy costs for each action type
- ✅ `getActionEnergyCost(actionType)` - Gets cost for an action

**`apps/backend/src/services/tickService.ts`** (NEW)
- ✅ `calculateDaysSinceLastTick(lastTickAt)` - Calculates days since last tick
- ✅ `applyDailyTick(userId)` - Resets energy to 100 on daily tick
- ✅ `ensureDailyTick(userId)` - Ensures tick is applied before actions

### 3. Backend Routes

**`apps/backend/src/routes/xp.ts`**
- ✅ Added energy check before action execution
- ✅ Deducts energy when action succeeds
- ✅ Returns 400 error with energy details if insufficient
- ✅ Calls `ensureDailyTick()` before checking energy

**`apps/backend/src/routes/dashboard.ts`**
- ✅ Calls `ensureDailyTick()` before loading dashboard
- ✅ Calculates and includes `energy`, `usableEnergy`, `energyCap` in response

**`apps/backend/src/routes/resources.ts`**
- ✅ Calls `ensureDailyTick()` before loading resources
- ✅ Includes `energy`, `usableEnergy`, `energyCap` in response (read-only)

**`apps/backend/src/routes/auth.ts`**
- ✅ Initializes `energy: 100` when creating new user resources

**`apps/backend/src/routes/questionnaire.ts`**
- ✅ Sets `energy: 100` when initializing resources after questionnaire

### 4. Frontend

**`apps/frontend/src/types/index.ts`**
- ✅ Added `energy?`, `usableEnergy?`, `energyCap?` to `Resources` interface

**`apps/frontend/src/components/EnergyCard.tsx`** (NEW)
- ✅ Displays current energy, usable energy, and cap
- ✅ Visual battery indicator based on energy level
- ✅ Shows Capacity modifier explanation
- ✅ Read-only display (no editing)

**`apps/frontend/src/pages/Dashboard.tsx`**
- ✅ Added Energy section (separate from Resources)
- ✅ Displays EnergyCard component
- ✅ Read-only, no editing capability

**`apps/frontend/src/components/QuickActions.tsx`**
- ✅ Updated error handling to show energy-specific error messages
- ✅ Displays clear message when energy is insufficient

---

## Database Migration Required

Run the following command to create and apply the migration:

```bash
cd apps/backend
npx prisma migrate dev --name add_energy_and_tick_tracking
```

This will:
1. Create a migration file adding `energy` to `resources` table
2. Add `lastTickAt` to `users` table
3. Apply the migration to your database
4. Update existing records:
   - Set `energy = 100` for all existing resources
   - Set `lastTickAt = NULL` for all users (will initialize on first action)

---

## Validation Checklist

Step 1 is complete when all of the following are true:

- [x] Energy exists in GameState (Resources model)
- [x] Daily Energy is capped and reset by Daily Tick
- [x] Capacity modifies usable Energy
- [x] Actions fail when Energy is insufficient
- [x] Energy changes are event-driven (through action execution)
- [x] UI shows Energy but cannot modify it

---

## Testing Instructions

### 1. Can I run out of Energy in one day?

1. Start with 100 energy (after daily tick)
2. Perform actions that consume energy:
   - Work Project: 30 energy
   - Exercise: 25 energy
   - Learning: 20 energy
3. After 3-4 actions, you should run out
4. Next action should fail with "Insufficient energy" error

### 2. Does trying again without a tick still fail?

1. After running out of energy
2. Try to perform another action
3. Should still fail (energy doesn't regenerate mid-day)
4. Error should show current usable energy and required energy

### 3. Does refreshing the app not restore Energy?

1. Perform actions to reduce energy
2. Refresh the page
3. Energy should remain at the reduced amount
4. Should NOT reset to 100

### 4. Does low Capacity visibly restrict me?

1. Set Capacity to < 30 (manually in database if needed for testing)
2. Usable energy should be capped at 70 (even if stored energy is 100)
3. Should not be able to perform actions requiring > 70 energy
4. Dashboard should show usable energy as 70, not 100

### 5. Does daily tick reset energy?

1. Perform actions to reduce energy
2. Wait until next day (or manually update `lastTickAt` in database to yesterday)
3. Perform any action or load dashboard
4. Energy should reset to 100 (or Capacity-modified cap if Capacity < 100)

---

## Capacity Modifier Logic

Energy cap based on Capacity (from MECHANICS_BASELINE.md):

- Capacity < 30: usable energy capped at **70**
- Capacity 30–60: usable energy capped at **85**
- Capacity 60–80: usable energy capped at **100**
- Capacity ≥ 80: usable energy capped at **110**

Energy is stored at full amount (100) but usable amount is capped by Capacity when checking actions.

---

## Action Energy Costs

- Work Project: **30 energy**
- Exercise: **25 energy**
- Learning: **20 energy**
- Save Expenses: **15 energy**
- Custom: **20 energy** (default)

---

## Next Steps

After validating Step 1, proceed to **Step 2: Enforce action costs universally**.

This step is already partially complete (energy costs are enforced), but Step 2 will ensure ALL actions have costs and no free actions remain.

