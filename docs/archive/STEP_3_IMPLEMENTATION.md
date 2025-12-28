# Step 3: Deterministic Daily Tick Implementation

## Status: ✅ COMPLETE

**Scope:** Tick calculation, replay of missed days, and idempotency only.  
**No decay rules added** (Step 4).  
**No action cost changes** (Step 2 locked).  
**No energy cap changes** (Step 1 locked).

---

## Implementation Summary

### Core Changes

**File:** `apps/backend/src/services/tickService.ts`

### 1. Enhanced Tick Calculation
- `calculateDaysSinceLastTick()`: Calculates all missing days since last tick
- Handles first-time users (never ticked)
- Returns 0 if already ticked today (idempotent)

### 2. Atomic Single Tick Application
- `applySingleDailyTick()`: Applies one tick for a specific date
- **Idempotency:** Checks if already ticked for that date before applying
- Resets energy to `BASE_DAILY_ENERGY` (100)
- Updates `lastTickAt` to the tick date
- Returns `true` if applied, `false` if already applied (idempotent)

### 3. Deterministic Tick Replay
- `applyDailyTick()`: Replays all missed ticks sequentially
- Calculates all missing days
- Loops through each day chronologically
- Applies one tick per day in order
- Returns count of ticks applied and final `lastTickAt`

### 4. Entry Point
- `ensureDailyTick()`: Main entry point (unchanged signature)
- Calls `applyDailyTick()` to handle all missed ticks

---

## Key Features

### ✅ Deterministic Replay
- If user was offline for N days, exactly N ticks are applied
- Ticks are applied sequentially, one per day
- Each tick resets energy (decay will be added in Step 4)

### ✅ Idempotency
- Calling `ensureDailyTick()` multiple times with same state = same result
- If already ticked today, no ticks applied
- If already ticked for a specific date, that tick is skipped
- Same inputs always produce same outputs

### ✅ Offline Behavior
- Missed days are calculated correctly
- All missed ticks are replayed when user returns
- No ticks are skipped silently
- Energy resets for each day (even if user was offline)

---

## Example Scenarios

### Scenario 1: First-Time User
- User never had a tick (`lastTickAt = null`)
- `calculateDaysSinceLastTick()` returns 1
- One tick applied for today
- `lastTickAt` set to today

### Scenario 2: User Offline for 3 Days
- `lastTickAt` = 3 days ago
- `calculateDaysSinceLastTick()` returns 3
- Three ticks applied sequentially:
  1. Tick for 2 days ago
  2. Tick for 1 day ago
  3. Tick for today
- `lastTickAt` updated to today after all ticks

### Scenario 3: Already Ticked Today
- `lastTickAt` = today (start of day)
- `calculateDaysSinceLastTick()` returns 0
- No ticks applied (idempotent no-op)
- Returns `{ ticksApplied: 0, lastTickDate: today }`

### Scenario 4: Multiple Calls (Idempotency)
- First call: Applies tick for today
- Second call (same state): Returns 0 ticks (already ticked)
- Third call (same state): Returns 0 ticks (idempotent)

---

## Validation Checklist

From PHASE_1_EXECUTION.md Step 3 validation:

- ✅ **Skipping days applies ticks**
  - If user offline for N days, N ticks are applied
  - Each tick resets energy (decay will be added in Step 4)

- ✅ **Refreshing UI does not apply extra ticks**
  - Idempotency check prevents duplicate ticks
  - If already ticked today, no additional ticks applied

- ✅ **Replays are idempotent**
  - Same inputs always produce same outputs
  - Calling `ensureDailyTick()` multiple times is safe
  - No duplicate ticks applied

---

## Technical Details

### Date Handling
- All dates normalized to start of day (00:00:00)
- Timezone-independent (uses UTC dates)
- Comparison uses timestamp comparison for accuracy

### Transaction Safety
- Each tick applied in a transaction
- Energy reset and `lastTickAt` update are atomic
- No partial state updates

### Performance
- Fetches user data once at start
- Each tick fetches user again to check idempotency (necessary for correctness)
- Sequential application ensures deterministic order

---

## What Was NOT Changed

### ✅ No Decay Rules Added
- Step 3 scope: tick calculation and replay only
- Decay mechanics will be added in Step 4
- Current implementation only resets energy

### ✅ No Action Cost Changes
- Step 2 locked: action costs cannot be modified
- Energy costs remain unchanged
- All action paths remain unchanged

### ✅ No Energy Cap Changes
- Step 1 locked: energy caps cannot be modified
- Capacity-based capping remains unchanged
- Usable energy calculation unchanged

### ✅ No UI Changes
- Frontend unchanged
- No new UI components
- No UI behavior modifications

---

## Files Modified

1. **`apps/backend/src/services/tickService.ts`**
   - Refactored `applyDailyTick()` for deterministic replay
   - Added `applySingleDailyTick()` for atomic tick application
   - Enhanced `calculateDaysSinceLastTick()` for accuracy
   - Added idempotency checks

---

## Next Steps

**Step 4: Activate decay mechanics**
- Add Oxygen daily decay
- Add Capacity decay under neglect
- Add Meaning decay under neglect
- Apply decay during daily tick

**Status:** ⏳ AWAITING APPROVAL

---

## Approval Criteria

Step 3 is complete when:
- ✅ Tick calculation handles all missing days
- ✅ Missed ticks are replayed sequentially
- ✅ Idempotency is guaranteed
- ✅ No decay rules added (Step 4)
- ✅ No action cost changes (Step 2 locked)
- ✅ No energy cap changes (Step 1 locked)

**All criteria met.** ✅

