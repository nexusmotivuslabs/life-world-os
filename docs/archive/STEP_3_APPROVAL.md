# Step 3: Formal Approval

## Deterministic Daily Tick

**Status:** ✅ **APPROVED**

**Approval Date:** 2024-12-24

---

## Success Criteria Verification

From PHASE_1_EXECUTION.md, Step 3 is complete only when all are true:

- ✅ **Skipping days applies ticks**
  - If user offline for N days, exactly N ticks are applied
  - Each tick resets energy (decay will be added in Step 4)
  - Ticks are applied sequentially, one per day

- ✅ **Refreshing UI does not apply extra ticks**
  - Idempotency check prevents duplicate ticks
  - If already ticked today, no additional ticks applied
  - Multiple calls with same state produce same result

- ✅ **Replays are idempotent**
  - Same inputs always produce same outputs
  - Already-ticked days are skipped automatically
  - Safe to call `ensureDailyTick()` multiple times

---

## Implementation Verification

### ✅ Tick Calculation
**Function:** `calculateDaysSinceLastTick()`
- ✅ Calculates all missing days since last tick
- ✅ Handles first-time users (never ticked)
- ✅ Returns 0 if already ticked today
- ✅ Uses start-of-day normalization for accuracy

### ✅ Atomic Single Tick
**Function:** `applySingleDailyTick()`
- ✅ Applies one tick for a specific date
- ✅ Idempotency check: skips if already ticked for that date
- ✅ Resets energy to BASE_DAILY_ENERGY (100)
- ✅ Updates lastTickAt to tick date
- ✅ Transaction-safe (atomic updates)

### ✅ Deterministic Replay
**Function:** `applyDailyTick()`
- ✅ Calculates all missing days
- ✅ Replays ticks sequentially, one per day
- ✅ Processes days in chronological order
- ✅ Returns count of ticks applied
- ✅ Handles offline periods correctly

### ✅ Entry Point
**Function:** `ensureDailyTick()`
- ✅ Unchanged signature (backward compatible)
- ✅ Calls `applyDailyTick()` to handle all missed ticks
- ✅ Used by all action routes (xp, training, investments, dashboard, resources)

---

## Scope Compliance

### ✅ Limited to Tick Mechanics Only
- ✅ Tick calculation implemented
- ✅ Replay of missed days implemented
- ✅ Idempotency guaranteed

### ✅ No Decay Rules Added
- ✅ Step 3 scope: tick mechanics only
- ✅ Decay will be added in Step 4
- ✅ Current implementation only resets energy

### ✅ No Action Cost Changes
- ✅ Step 2 locked: action costs cannot be modified
- ✅ Energy costs remain unchanged
- ✅ All action paths remain unchanged

### ✅ No Energy Cap Changes
- ✅ Step 1 locked: energy caps cannot be modified
- ✅ Capacity-based capping remains unchanged
- ✅ Usable energy calculation unchanged

### ✅ No UI Changes
- ✅ Frontend unchanged
- ✅ No new UI components
- ✅ No UI behavior modifications

---

## Test Scenarios

### ✅ Scenario 1: First-Time User
- User never had a tick (`lastTickAt = null`)
- Result: 1 tick applied for today
- `lastTickAt` set to today

### ✅ Scenario 2: User Offline for 3 Days
- `lastTickAt` = 3 days ago
- Result: 3 ticks applied sequentially (one per day)
- `lastTickAt` updated to today after all ticks

### ✅ Scenario 3: Already Ticked Today
- `lastTickAt` = today (start of day)
- Result: No ticks applied (idempotent no-op)
- Returns `{ ticksApplied: 0, lastTickDate: today }`

### ✅ Scenario 4: Multiple Calls (Idempotency)
- First call: Applies tick for today
- Second call (same state): Returns 0 ticks (already ticked)
- Third call (same state): Returns 0 ticks (idempotent)

---

## Files Modified

1. **`apps/backend/src/services/tickService.ts`**
   - Refactored `applyDailyTick()` for deterministic replay
   - Added `applySingleDailyTick()` for atomic tick application
   - Enhanced `calculateDaysSinceLastTick()` for accuracy
   - Added `getStartOfDay()` helper for date normalization
   - Added idempotency checks throughout

---

## Integration Points

All routes that call `ensureDailyTick()` now benefit from deterministic replay:
- ✅ `POST /xp/activity` (main activities)
- ✅ `POST /training/tasks/:taskId/complete` (training tasks)
- ✅ `POST /investments` (investment creation)
- ✅ `GET /dashboard` (dashboard data)
- ✅ `GET /resources` (resource data)

All routes correctly handle offline periods by replaying missed ticks.

---

## Validation Results

### ✅ Deterministic Behavior
- Same event sequence always produces same state
- Offline periods handled correctly
- No random or unpredictable behavior

### ✅ Idempotency
- Multiple calls with same state = same result
- Already-ticked days skipped automatically
- No duplicate ticks applied

### ✅ Performance
- Efficient date calculations
- Sequential processing ensures correctness
- Transaction safety prevents race conditions

---

## Approval Sign-Off

**Step 3 meets all success criteria defined in PHASE_1_EXECUTION.md.**

✅ **APPROVED** - Deterministic daily tick is implemented

**Validated By:** User  
**Validation Date:** 2024-12-24

**Status:** Tick mechanics are complete and deterministic.

---

## Next Step

**Step 4: Activate decay mechanics**

**Status:** ⏳ AWAITING APPROVAL

Do not proceed until explicitly approved.

---

## Technical Notes

- Date handling uses start-of-day normalization (00:00:00)
- All comparisons use timestamp comparison for accuracy
- Each tick applied in a transaction for atomicity
- Sequential application ensures deterministic order
- Idempotency checks prevent duplicate ticks

