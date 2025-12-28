# Step 6: Burnout Failure State Implementation

## Status: ✅ COMPLETE (Updated to Canonical Requirements)

**Scope:** Burnout failure state only.  
**No modifications to:** Decay rules, Capacity bands, action costs, tick logic, or UI behavior.

---

## Implementation Summary

### Core Changes

**Files Created:**
- `apps/backend/src/services/burnoutService.ts` - Burnout tracking, triggering, penalties, and recovery logic

**Files Modified:**
- `apps/backend/prisma/schema.prisma` - Added burnout tracking fields to User model
- `apps/backend/src/services/tickService.ts` - Integrated burnout tracking and recovery into daily tick
- `apps/backend/src/services/energyService.ts` - Added burnout energy cap (40)
- `apps/backend/src/routes/xp.ts` - Block Work actions, apply burnout XP penalty
- `apps/backend/src/routes/training.ts` - Apply burnout XP penalty
- `apps/backend/src/routes/resources.ts` - Include burnout status in response
- `apps/backend/src/routes/dashboard.ts` - Include burnout status in response

### Burnout Mechanics (Canonical)

**Trigger:**
- Capacity < 20 for 3 consecutive daily ticks
- Tracked during daily tick
- Triggers automatically

**Penalties:**
- Energy cap: 40 (significantly reduced, regardless of Capacity)
- XP reduction: -70% (heavily penalised, multiplier 0.3)
- Action blocking: Work Project actions blocked (403 error)

**Recovery:**
- Requires all of:
  - Capacity > 25 (must rise above exit threshold)
  - Recovery/rest-type actions performed (Exercise, Learning, Save Expenses)
  - At least one daily tick has passed (minimum recovery duration)
- Recovery is not cleared by "one good action" - requires time + actions
- Checked during daily tick

---

## Implementation Details

### 1. Database Schema Changes

Added fields to User model:
- `isInBurnout: Boolean` - Current burnout state
- `burnoutTriggeredAt: DateTime?` - When burnout was triggered
- `consecutiveLowCapacityDays: Int` - Consecutive daily ticks with Capacity < 20 (for trigger tracking)

### 2. Burnout Service

**File:** `apps/backend/src/services/burnoutService.ts`

**Constants (Canonical):**
- `TRIGGER_THRESHOLD: 3` - Consecutive daily ticks with Capacity < 20
- `LOW_CAPACITY_THRESHOLD: 20` - Capacity threshold for burnout trigger
- `RECOVERY_CAPACITY_THRESHOLD: 25` - Capacity threshold for recovery exit
- `MIN_RECOVERY_DURATION: 1` - Minimum daily ticks that must pass (at least one)
- `BURNOUT_ENERGY_CAP: 40` - Energy cap during burnout (significantly reduced)
- `BURNOUT_XP_PENALTY: 0.3` - XP gain multiplier during burnout (70% reduction - heavily penalised)

**Recovery Actions:**
- EXERCISE - Increases Capacity
- LEARNING - Increases Capacity
- SAVE_EXPENSES - Financial stability

**Functions:**
- `updateLowCapacityTracking()`: Tracks consecutive daily ticks with Capacity < 20, triggers burnout when threshold met (3 ticks)
- `triggerBurnout()`: Sets user to burnout state, records trigger timestamp
- `updateBurnoutRecovery()`: Checks recovery conditions (Capacity > 25, recovery actions performed, at least one tick passed)
- `completeBurnoutRecovery()`: Removes burnout state, resets trigger tracking
- `isInBurnout()`: Checks if user is in burnout
- `getBurnoutXPModifier()`: Returns 0.3 (70% reduction) if in burnout
- `hasRecoveryActionsSince()`: Checks if recovery actions were performed since a date

### 3. Tick Service Integration

**File:** `apps/backend/src/services/tickService.ts`

**Changes:**
- After applying decay, update low capacity tracking (if not in burnout)
- Trigger burnout if threshold met (3 consecutive ticks with Capacity < 20)
- If in burnout, check recovery conditions
- Complete recovery if all conditions met

**Logic:**
1. Apply decay (Step 4)
2. If not in burnout: Update low capacity tracking (check if Capacity < 20)
3. If consecutiveLowCapacityDays >= 3, trigger burnout
4. If in burnout: Check recovery conditions
   - Capacity > 25?
   - Recovery actions performed since burnout triggered?
   - At least one tick has passed? (automatic if we're in a tick after trigger)
5. If all recovery conditions met, complete recovery

### 4. Energy Service Integration

**File:** `apps/backend/src/services/energyService.ts`

**Changes:**
- `getEffectiveEnergy()` now accepts `isInBurnout` parameter
- If in burnout, energy cap is 40 (significantly reduced, overrides Capacity-based cap)
- Otherwise, uses Capacity-based cap (Step 1 logic)

### 5. Action Route Integration

**Main Activity Route (`/xp/activity`):**
- Check burnout status
- Block Work Project actions if in burnout (403 error)
- Apply burnout XP penalty (-70%) to all XP gains
- Include burnout status in response

**Training Route (`/training/tasks/:taskId/complete`):**
- Check burnout status
- Apply burnout XP penalty (-70%) to XP gains
- Include burnout status in response

**Resources & Dashboard Routes:**
- Include burnout status in responses
- Apply burnout energy cap in usable energy calculations

---

## Key Features

### ✅ Burnout Trigger (Canonical)
- Tracks consecutive daily ticks with Capacity < 20
- Triggers automatically after 3 consecutive ticks
- Triggered during daily tick

### ✅ Burnout Penalties (Canonical)
- **Energy Cap:** Reduced to 40 (significantly reduced)
- **XP Reduction:** All XP gains reduced by 70% (heavily penalised, multiplier 0.3)
- **Action Blocking:** Work Project actions blocked (403 error)
- **Decay Continues:** Decay is not frozen during burnout

### ✅ Burnout Recovery (Canonical)
- Requires all conditions:
  - Capacity > 25 (must rise above exit threshold)
  - Recovery actions performed (Exercise, Learning, Save Expenses)
  - At least one daily tick has passed (minimum recovery duration)
- Recovery is not cleared by "one good action" - requires time + actions
- Checked during daily tick

---

## Scope Compliance

### ✅ Burnout Failure State Only
- Burnout trigger implemented (canonical thresholds)
- Burnout penalties implemented (canonical effects)
- Burnout recovery implemented (canonical rules)

### ✅ No Decay Rules Changes
- Decay rates unchanged (Step 4 locked)
- Decay triggers unchanged
- Decay schedules unchanged
- Decay continues during burnout (no freeze)

### ✅ No Capacity Band Changes
- Capacity modifiers unchanged (Step 5 locked)
- Band definitions unchanged

### ✅ No Action Cost Changes
- Energy costs unchanged (Step 2 locked)
- Action execution unchanged (except Work blocking during burnout)

### ✅ No Tick Changes
- Tick logic unchanged (Step 3 locked)
- Tick application unchanged (only adds burnout tracking)

### ✅ No UI Changes
- Frontend unchanged
- No new components
- No UI explanations
- No popups

### ✅ No Additional Failure States
- Only Burnout implemented
- No other failure states added

### ✅ No New Stats
- No new stats added
- Uses existing Capacity stat

---

## Validation Checklist

From PHASE_1_EXECUTION.md Step 6 validation:

- ✅ **Burnout restricts play**
  - Energy cap reduced to 40 (significantly reduced)
  - XP gain reduced by 70% (heavily penalised)
  - Work Project actions blocked

- ✅ **Recovery requires time and actions**
  - Minimum recovery duration (at least one tick)
  - Requires recovery/rest-type actions
  - Capacity must rise above exit threshold
  - Cannot be instantly cleared

- ✅ **Burnout cannot be instantly cleared**
  - Requires at least one daily tick
  - Requires recovery actions
  - Requires Capacity above threshold
  - Not cleared by "one good action"

---

## Files Modified

1. **`apps/backend/prisma/schema.prisma`**
   - Added burnout tracking fields to User model

2. **`apps/backend/src/services/burnoutService.ts`** (NEW)
   - Burnout tracking logic (canonical thresholds)
   - Trigger and recovery functions (canonical rules)
   - Helper functions

3. **`apps/backend/src/services/tickService.ts`**
   - Integrated burnout tracking into daily tick
   - Trigger and recovery checks

4. **`apps/backend/src/services/energyService.ts`**
   - Added burnout energy cap logic (40)

5. **`apps/backend/src/routes/xp.ts`**
   - Work Project blocking during burnout
   - Burnout XP penalty application (70% reduction)
   - Burnout status in response

6. **`apps/backend/src/routes/training.ts`**
   - Burnout XP penalty application (70% reduction)
   - Burnout status in response

7. **`apps/backend/src/routes/resources.ts`**
   - Burnout status in response
   - Burnout energy cap in calculations

8. **`apps/backend/src/routes/dashboard.ts`**
   - Burnout status in response
   - Burnout energy cap in calculations

---

## Next Steps

**Migration Required:**
- Run Prisma migration to add burnout tracking fields to User model
- `npx prisma migrate dev --name add_burnout_tracking`

**Step 7: Enforce over-optimisation penalties**

**Status:** ⏳ AWAITING APPROVAL

Do not proceed until explicitly approved.

---

## Approval Criteria

Step 6 is complete when:
- ✅ Burnout trigger implemented (Capacity < 20 for 3 consecutive ticks)
- ✅ Burnout penalties implemented (energy cap 40, XP -70%, block Work)
- ✅ Burnout recovery implemented (Capacity > 25, recovery actions, at least one tick)
- ✅ Burnout restricts play
- ✅ Recovery requires time and actions
- ✅ Burnout cannot be instantly cleared
- ✅ Decay continues during burnout
- ✅ No decay rules changed
- ✅ No Capacity bands changed
- ✅ No action costs changed
- ✅ No tick logic changed
- ✅ No UI changes
- ✅ No additional failure states
- ✅ No new stats

**All criteria met.** ✅
