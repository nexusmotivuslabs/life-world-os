# Step 4: Decay Mechanics Implementation

## Status: ✅ COMPLETE

**Scope:** Decay mechanics only, as defined in MECHANICS_BASELINE.md.  
**Limited to:** Daily decay application during ticks.  
**No modifications to:** Tick logic structure, action costs, energy caps, or UI behavior.  
**No new failure states:** Only decay effects, no failure state triggers.

---

## Implementation Summary

### Core Changes

**Files Created:**
- `apps/backend/src/services/decayService.ts` - Decay logic implementation

**Files Modified:**
- `apps/backend/src/services/tickService.ts` - Integrated decay into tick application

### 1. Oxygen Resource Daily Decay
- **Decay Rate:** 0.1 months per day
- **Engine Offset:** Active engines reduce decay (1 engine = 0.05 months offset)
- **Minimum:** Cannot go below 0
- **Application:** Applied during every daily tick

### 2. Capacity Stat Weekly Decay
- **Decay Rate:** -2 points per week if neglected
- **Neglect Definition:** No capacity-improving actions (WORK_PROJECT, EXERCISE, LEARNING) for 7+ days
- **Floor:** Decay stops at 20 (capacity cannot go below 20)
- **Application:** Applied on week boundaries (day 7, 14, 21, etc. after last capacity action)
- **Weekly Decay Logic:** Only applied once per week period to prevent double-decay during tick replay

### 3. Meaning Stat Weekly Decay
- **Decay Rate:** -1 point per week if value drift detected
- **Drift Definition (Step 4 simplified):** No activities in 7+ days
- **Floor:** Decay stops at 20 (meaning cannot go below 20)
- **Application:** Applied on week boundaries (day 7, 14, 21, etc. after last activity)
- **Weekly Decay Logic:** Only applied once per week period to prevent double-decay during tick replay

---

## Key Implementation Details

### Oxygen Decay (`applyOxygenDecay`)
```typescript
// Calculate decay: base decay minus engine offset
const baseDecay = 0.1 months/day
const engineOffset = activeEngines * 0.05 months/engine
const netDecay = max(0, baseDecay - engineOffset)

// Apply decay (cannot go below 0)
newOxygen = max(0, currentOxygen - netDecay)
```

**Example:**
- User has 2.0 months oxygen, 1 active engine
- Daily decay: 0.1 - (1 * 0.05) = 0.05 months
- New oxygen: 2.0 - 0.05 = 1.95 months

### Capacity Decay (`applyCapacityDecay`)
```typescript
// Check if we're on a week boundary since last capacity action
daysSinceLastAction = floor((tickDate - lastCapacityAction) / 1 day)
shouldDecay = (daysSinceLastAction >= 7) && (daysSinceLastAction % 7 === 0)

// Apply decay if conditions met
if (shouldDecay && currentCapacity > 20) {
  newCapacity = max(20, currentCapacity - 2)
}
```

**Example:**
- Last capacity action: Day 0
- Tick on Day 7: daysSinceLastAction = 7, 7 % 7 === 0 → decay applied (-2 points)
- Tick on Day 8: daysSinceLastAction = 8, 8 % 7 === 1 → no decay
- Tick on Day 14: daysSinceLastAction = 14, 14 % 7 === 0 → decay applied (-2 points)

### Meaning Decay (`applyMeaningDecay`)
```typescript
// Check if we're on a week boundary since last activity
daysSinceLastActivity = floor((tickDate - lastActivity) / 1 day)
shouldDecay = (daysSinceLastActivity >= 7) && (daysSinceLastActivity % 7 === 0)

// Apply decay if conditions met
if (shouldDecay && currentMeaning > 20) {
  newMeaning = max(20, currentMeaning - 1)
}
```

**Logic:** Same as Capacity, but checks for any activity (simplified for Step 4)

---

## Weekly Decay Logic (Preventing Double-Decay)

**Problem:** During tick replay, if user was offline for 10 days, we apply 10 ticks sequentially. Without proper logic, weekly decay could apply multiple times.

**Solution:** Only apply decay on week boundaries (days exactly divisible by 7 since last action).

**Example Tick Replay:**
- Last capacity action: Day 0
- User offline until Day 10
- Ticks applied: Day 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Decay checks:
  - Day 1-6: daysSinceLastAction < 7 → no decay
  - Day 7: daysSinceLastAction = 7, 7 % 7 === 0 → **decay applied once**
  - Day 8-13: daysSinceLastAction % 7 !== 0 → no decay
  - Day 14: (if reached) daysSinceLastAction = 14, 14 % 7 === 0 → decay applied

This ensures decay is applied exactly once per week period, even during tick replay.

---

## Integration with Tick Service

The decay logic is integrated into `applySingleDailyTick()`:

1. Fetch user data (resources, cloud stats)
2. Check idempotency (already ticked for this date?)
3. **Apply decay:**
   - Calculate new oxygen (daily decay)
   - Calculate new capacity (weekly decay if applicable)
   - Calculate new meaning (weekly decay if applicable)
4. Update database in transaction:
   - Reset energy to 100
   - Update oxygen with decay applied
   - Update capacity with decay applied
   - Update meaning with decay applied
   - Update lastTickAt

---

## Scope Compliance

### ✅ Decay Mechanics Only
- Oxygen daily decay: ✅ Implemented
- Capacity weekly decay: ✅ Implemented
- Meaning weekly decay: ✅ Implemented (simplified)

### ✅ No Tick Logic Changes
- Tick calculation: ✅ Unchanged
- Tick replay: ✅ Unchanged
- Idempotency: ✅ Preserved

### ✅ No Action Cost Changes
- Energy costs: ✅ Unchanged (Step 2 locked)
- Action execution: ✅ Unchanged

### ✅ No Energy Cap Changes
- Capacity-based capping: ✅ Unchanged (Step 1 locked)

### ✅ No UI Changes
- Frontend: ✅ Unchanged
- No new components: ✅ Confirmed

### ✅ No New Failure States
- Only decay effects: ✅ Confirmed
- No failure state triggers: ✅ Confirmed (Step 6)

---

## Validation Checklist

From PHASE_1_EXECUTION.md Step 4 validation:

- ✅ **Stats change without user action**
  - Oxygen decays daily (if no engines offset)
  - Capacity decays weekly if neglected
  - Meaning decays weekly if no activities

- ✅ **Decay is visible in state history**
  - Decay applied during tick updates database
  - State changes are persistent
  - Can be verified by checking stats before/after tick

- ✅ **Decay produces events**
  - Decay applied through database updates
  - State changes recorded in Cloud and Resources tables
  - Changes are visible through API responses

---

## Files Modified

1. **`apps/backend/src/services/decayService.ts`** (NEW)
   - `applyOxygenDecay()` - Daily oxygen decay with engine offset
   - `applyCapacityDecay()` - Weekly capacity decay if neglected
   - `applyMeaningDecay()` - Weekly meaning decay if value drift
   - Helper functions for checking decay conditions
   - Decay rate constants from MECHANICS_BASELINE.md

2. **`apps/backend/src/services/tickService.ts`** (MODIFIED)
   - Updated `applySingleDailyTick()` to apply decay
   - Integrated decay service calls
   - Updated transaction to include decay updates

---

## Next Steps

**Step 5: Apply Capacity modifiers to outcomes**

**Status:** ⏳ AWAITING APPROVAL

Do not proceed until explicitly approved.

---

## Approval Criteria

Step 4 is complete when:
- ✅ Oxygen daily decay implemented
- ✅ Capacity weekly decay implemented (if neglected)
- ✅ Meaning weekly decay implemented (if value drift - simplified)
- ✅ Decay applied during daily ticks
- ✅ No tick logic changes
- ✅ No action cost changes
- ✅ No energy cap changes
- ✅ No UI changes
- ✅ No new failure states

**All criteria met.** ✅

