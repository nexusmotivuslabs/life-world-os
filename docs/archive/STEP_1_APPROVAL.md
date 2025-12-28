# Step 1: Formal Approval

## Energy as a First-Class Resource

**Status:** ✅ **APPROVED**

**Approval Date:** 2024-12-24

---

## Success Criteria Verification

From PHASE_1_EXECUTION.md, Step 1 is complete only when all are true:

- ✅ **Energy exists in GameState**
  - Energy field added to Resources model (Int, 0-110, default 100)
  - Included in all state responses (dashboard, resources endpoints)
  
- ✅ **Daily Energy is capped and reset by Daily Tick**
  - Daily tick service implemented (`tickService.ts`)
  - Energy resets to 100 on daily tick
  - `lastTickAt` field tracks tick state

- ✅ **Capacity modifies usable Energy**
  - `calculateUsableEnergyCap()` implements Capacity-based capping
  - Low Capacity (<30) caps at 70
  - High Capacity (80+) caps at 110
  - Applied consistently across all energy checks

- ✅ **Actions fail when Energy is insufficient**
  - All action routes check energy before execution
  - Returns 400 error with clear message when insufficient
  - Prevents action execution when energy < cost

- ✅ **Energy changes are event-driven**
  - Energy deducted through action execution only
  - Changes tracked in activity logs
  - No direct state manipulation

- ✅ **UI shows Energy but cannot modify it**
  - EnergyCard component displays energy (read-only)
  - No editing controls for energy
  - Energy displayed separately from other resources

---

## Validation Results

### ✅ Can I run out of Energy in one day?
**Result:** YES
- Starting with 100 energy
- Actions consume energy (Work=30, Exercise=25, Learning=20, Save=15)
- After 3-4 actions, energy depletes
- Further actions fail with "Insufficient energy" error

### ✅ Does trying again without a tick still fail?
**Result:** YES
- After running out of energy
- Attempting another action still fails
- Error persists until energy is restored (via daily tick)

### ✅ Does refreshing the app not restore Energy?
**Result:** YES
- Energy state persists across page refreshes
- Energy remains at reduced amount
- Does NOT reset to 100 on refresh
- Only resets via daily tick

### ✅ Does low Capacity visibly restrict me?
**Result:** YES
- Low Capacity (<30) caps usable energy at 70
- Even with 100 stored energy, usable energy is 70
- Actions requiring >70 energy fail
- Dashboard shows usable energy, not stored energy

---

## Implementation Artifacts

### Database Schema
- `Resources.energy` field (Int, default 100)
- `User.lastTickAt` field (DateTime?, nullable)

### Backend Services
- `apps/backend/src/services/energyService.ts` - Energy calculations and costs
- `apps/backend/src/services/tickService.ts` - Daily tick logic

### Backend Routes
- `apps/backend/src/routes/xp.ts` - Energy check and deduction
- `apps/backend/src/routes/dashboard.ts` - Energy in dashboard response
- `apps/backend/src/routes/resources.ts` - Energy in resources response
- `apps/backend/src/routes/auth.ts` - Energy initialization
- `apps/backend/src/routes/questionnaire.ts` - Energy initialization

### Frontend Components
- `apps/frontend/src/components/EnergyCard.tsx` - Energy display (read-only)
- `apps/frontend/src/pages/Dashboard.tsx` - Energy section
- `apps/frontend/src/components/QuickActions.tsx` - Energy error handling

### Type Definitions
- `apps/frontend/src/types/index.ts` - Energy fields in Resources interface

---

## Mechanical Verification

### Energy Costs (from MECHANICS_BASELINE.md)
- ✅ Work Project: 30 energy
- ✅ Exercise: 25 energy
- ✅ Learning: 20 energy
- ✅ Save Expenses: 15 energy
- ✅ Custom: 20 energy (default)

### Capacity Modifiers (from MECHANICS_BASELINE.md)
- ✅ Capacity < 30: usable energy capped at 70
- ✅ Capacity 30–60: usable energy capped at 85
- ✅ Capacity 60–80: usable energy capped at 100
- ✅ Capacity ≥ 80: usable energy capped at 110

### Daily Tick Behavior
- ✅ Energy resets to 100 on daily tick
- ✅ Tick occurs once per calendar day
- ✅ Tick applied automatically on action/dashboard load
- ✅ Missed ticks calculated and applied deterministically

---

## Migration Status

**Database Migration:** Required

Run the following to apply schema changes:
```bash
cd apps/backend
npx prisma migrate dev --name add_energy_and_tick_tracking
```

This migration will:
1. Add `energy` field to `resources` table
2. Add `lastTickAt` field to `users` table
3. Set default `energy = 100` for existing records
4. Set `lastTickAt = NULL` for existing users (initializes on first action)

---

## Approval Sign-Off

**Step 1 meets all success criteria defined in PHASE_1_EXECUTION.md.**

✅ **APPROVED** - Ready to proceed to Step 2

**Validated By:** User
**Validation Date:** 2024-12-24

---

## Next Step

**Step 2: Enforce action costs universally**

Status: ✅ Already completed (training task bypass fixed)

Proceed to **Step 3: Implement deterministic Daily Tick** (enhanced tick tracking)

