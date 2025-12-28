# Step 4: Formal Approval

## Decay Mechanics Activation

**Status:** ✅ **APPROVED & LOCKED**

**Approval Date:** 2024-12-24

---

## Success Criteria Verification

From PHASE_1_EXECUTION.md, Step 4 is complete only when all are true:

- ✅ **Oxygen daily decay implemented**
  - Decay rate: 0.1 months per day
  - Engine offset: 1 active engine = 0.05 months offset
  - Minimum: Cannot go below 0
  - Applied: Every daily tick

- ✅ **Capacity weekly decay implemented**
  - Decay rate: -2 points per week if neglected
  - Neglect definition: No capacity-improving actions (WORK_PROJECT, EXERCISE, LEARNING) for 7+ days
  - Floor: 20 (cannot go below)
  - Applied: On week boundaries (day 7, 14, 21, etc. after last capacity action)

- ✅ **Meaning weekly decay implemented**
  - Decay rate: -1 point per week if value drift detected
  - Drift definition (Step 4 simplified): No activities in 7+ days
  - Floor: 20 (cannot go below)
  - Applied: On week boundaries (day 7, 14, 21, etc. after last activity)

- ✅ **Stats change without user action**
  - Decay applied during daily ticks
  - State changes are persistent
  - Decay visible through API responses

- ✅ **Decay produces state changes**
  - Database updates applied during tick
  - Changes recorded in Cloud and Resources tables
  - State changes are deterministic

---

## Implementation Verification

### ✅ Oxygen Daily Decay
**Function:** `applyOxygenDecay()`
- ✅ Calculates base decay (0.1 months/day)
- ✅ Applies engine offset (0.05 months per active engine)
- ✅ Enforces minimum (cannot go below 0)
- ✅ Applied during every daily tick

### ✅ Capacity Weekly Decay
**Function:** `applyCapacityDecay()`
- ✅ Checks for capacity-improving actions (WORK_PROJECT, EXERCISE, LEARNING)
- ✅ Applies decay on week boundaries (prevents double-decay during replay)
- ✅ Enforces floor (20 minimum)
- ✅ Decay rate: -2 points per week

### ✅ Meaning Weekly Decay
**Function:** `applyMeaningDecay()`
- ✅ Checks for activity in last 7 days (simplified for Step 4)
- ✅ Applies decay on week boundaries (prevents double-decay during replay)
- ✅ Enforces floor (20 minimum)
- ✅ Decay rate: -1 point per week

### ✅ Integration with Tick Service
**File:** `apps/backend/src/services/tickService.ts`
- ✅ Decay applied in `applySingleDailyTick()`
- ✅ All decay calculations happen before database updates
- ✅ Atomic transaction ensures consistency
- ✅ Idempotency preserved

---

## Locked Status

**Decay mechanics are now LOCKED:**
- ✅ No modifications to decay rates allowed
- ✅ No changes to decay triggers allowed
- ✅ No modifications to decay schedules allowed
- ✅ All decay behavior is canonical

**Canonical Decay Rates (Locked):**
- Oxygen daily decay: 0.1 months/day
- Oxygen engine offset: 0.05 months/active engine
- Capacity weekly decay: -2 points/week (if neglected)
- Capacity floor: 20
- Meaning weekly decay: -1 point/week (if value drift)
- Meaning floor: 20

**Canonical Decay Triggers (Locked):**
- Oxygen: Every daily tick
- Capacity: Week boundaries (7, 14, 21 days) after last capacity action
- Meaning: Week boundaries (7, 14, 21 days) after last activity

**Canonical Decay Schedules (Locked):**
- Oxygen: Daily (every tick)
- Capacity: Weekly (if neglected)
- Meaning: Weekly (if value drift)

---

## Scope Compliance

### ✅ Decay Mechanics Only
- ✅ Oxygen decay: Implemented and locked
- ✅ Capacity decay: Implemented and locked
- ✅ Meaning decay: Implemented and locked (simplified for Step 4)

### ✅ No Tick Logic Changes
- ✅ Tick calculation: Unchanged
- ✅ Tick replay: Unchanged
- ✅ Idempotency: Preserved

### ✅ No Action Cost Changes
- ✅ Energy costs: Unchanged (Step 2 locked)
- ✅ Action execution: Unchanged

### ✅ No Energy Cap Changes
- ✅ Capacity-based capping: Unchanged (Step 1 locked)

### ✅ No UI Changes
- ✅ Frontend: Unchanged
- ✅ No new components: Confirmed

### ✅ No New Failure States
- ✅ Only decay effects: Confirmed
- ✅ No failure state triggers: Confirmed (Step 6)

---

## Validation Results

### ✅ Stats Change Without User Action
- Oxygen decays daily (if no engines offset)
- Capacity decays weekly if neglected
- Meaning decays weekly if no activities
- All decay is automatic and deterministic

### ✅ Decay Visible in State
- Decay applied during tick updates database
- State changes are persistent
- Can be verified by checking stats before/after tick

### ✅ Decay Produces State Changes
- Decay applied through database updates
- State changes recorded in Cloud and Resources tables
- Changes are visible through API responses

---

## Files Created/Modified

### Created
1. **`apps/backend/src/services/decayService.ts`**
   - Decay logic implementation
   - Decay rate constants
   - Helper functions for decay conditions

### Modified
1. **`apps/backend/src/services/tickService.ts`**
   - Integrated decay into `applySingleDailyTick()`
   - Decay calculations before database updates
   - Atomic transaction includes decay

---

## Approval Sign-Off

**Step 4 meets all success criteria defined in PHASE_1_EXECUTION.md.**

✅ **APPROVED** - Decay mechanics are complete and locked

**Validated By:** User  
**Validation Date:** 2024-12-24

**Status:** Decay rates, triggers, and schedules are **CANONICAL**. No modifications allowed.

---

## Next Step

**Step 5: Apply Capacity modifiers to outcomes**

**Status:** ⏳ AWAITING APPROVAL

Do not proceed until explicitly approved.

---

## Technical Notes

- Decay rates match MECHANICS_BASELINE.md exactly
- Weekly decay uses week boundaries to prevent double-decay during replay
- All decay respects floors (Oxygen: 0, Capacity: 20, Meaning: 20)
- Decay is deterministic and idempotent
- Decay behavior is now canonical and locked

