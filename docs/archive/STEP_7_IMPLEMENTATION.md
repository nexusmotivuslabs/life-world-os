# Step 7: Over-Optimisation Penalties Implementation

## Status: ✅ COMPLETE

**Scope:** Over-optimisation penalties only.  
**No modifications to:** Decay rules, Capacity bands, action costs, tick logic, Burnout, or UI behavior.

---

## Implementation Summary

### Core Changes

**Files Created:**
- `apps/backend/src/services/overOptimisationService.ts` - Over-optimisation detection and penalty application

**Files Modified:**
- `apps/backend/prisma/schema.prisma` - Added `lastWeeklyTickAt` field to User model
- `apps/backend/src/services/tickService.ts` - Integrated weekly tick evaluation into daily tick system

### Over-Optimisation Penalties (Canonical)

**Excessive Work Dominance:**
- **Definition:** Work actions > 60% of total actions in past week
- **Penalties:** Capacity -5, Meaning -3

**Excessive Saving Dominance:**
- **Definition:** Save actions > 40% of total actions in past week
- **Penalties:** Meaning -4

**Excessive Learning Without Execution:**
- **Definition:** Learning actions > 50% of total, no Work/Exercise actions
- **Penalties:** Optionality -4

---

## Implementation Details

### 1. Database Schema Changes

Added field to User model:
- `lastWeeklyTickAt: DateTime?` - Last weekly tick timestamp for over-optimisation evaluation

### 2. Over-Optimisation Service

**File:** `apps/backend/src/services/overOptimisationService.ts`

**Functions:**
- `analyzeActionDistribution()`: Analyzes action history for past 7 days, returns counts by type
- `detectExcessiveWork()`: Checks if Work actions > 60% of total
- `detectExcessiveSaving()`: Checks if Save actions > 40% of total
- `detectExcessiveLearning()`: Checks if Learning > 50% and no Work/Exercise actions
- `evaluateOverOptimisationPenalties()`: Evaluates all imbalances, returns penalty adjustments
- `applyOverOptimisationPenalties()`: Applies penalties to stats (enforces floors, stats cannot go below 0)

**Constants (Canonical):**
- `WORK_DOMINANCE_THRESHOLD: 0.6` - Work actions > 60%
- `SAVING_DOMINANCE_THRESHOLD: 0.4` - Save actions > 40%
- `LEARNING_DOMINANCE_THRESHOLD: 0.5` - Learning actions > 50%
- `EXCESSIVE_WORK_CAPACITY_PENALTY: -5`
- `EXCESSIVE_WORK_MEANING_PENALTY: -3`
- `EXCESSIVE_SAVING_MEANING_PENALTY: -4`
- `EXCESSIVE_LEARNING_OPTIONALITY_PENALTY: -4`

### 3. Weekly Tick Evaluation

**File:** `apps/backend/src/services/tickService.ts`

**Integration:**
- During each daily tick, check if weekly evaluation should occur
- Weekly evaluation happens when 7 days have passed since `lastWeeklyTickAt`
- If no previous weekly tick, check if 7 days have passed since account creation
- When weekly evaluation occurs:
  1. Analyze action distribution for past 7 days
  2. Detect imbalances (Work dominance, Saving dominance, Learning without execution)
  3. Calculate penalty adjustments
  4. Apply penalties to stats (Capacity, Meaning, Optionality)
  5. Update `lastWeeklyTickAt` to current tick date

**Order of Operations:**
1. Apply decay (Step 4)
2. Evaluate over-optimisation penalties (Step 7) - if weekly tick
3. Update burnout tracking (Step 6) - uses capacity after penalties
4. Update recovery tracking (Step 6)
5. Apply all changes in transaction

### 4. Action History Analysis

**Analysis Window:**
- Past 7 days from tick date
- Counts only player actions (excludes system events like SEASON_COMPLETION, MILESTONE)
- Counts: Work Project, Save Expenses, Learning, Exercise
- CUSTOM actions don't count toward imbalance (too variable)

**Imbalance Detection:**
- Work dominance: `workCount / totalCount > 0.6`
- Saving dominance: `saveCount / totalCount > 0.4`
- Learning without execution: `learningCount / totalCount > 0.5` AND `workCount === 0 && exerciseCount === 0`

### 5. Penalty Application

**Penalties are applied to:**
- Capacity: Reduced by -5 if excessive work
- Meaning: Reduced by -3 if excessive work, -4 if excessive saving
- Optionality: Reduced by -4 if excessive learning without execution

**Enforcement:**
- Stats cannot go below 0 (floors enforced)
- Penalties are cumulative (if both Work and Saving are excessive, Meaning gets both penalties)
- Penalties applied deterministically based on action history
- Changes logged in database (via Cloud update)

---

## Key Features

### ✅ Weekly Tick Evaluation
- Evaluates every 7 days
- Based on `lastWeeklyTickAt` tracking
- Integrated into daily tick system
- Deterministic and idempotent

### ✅ Action History Analysis
- Analyzes past 7 days of actions
- Counts player actions only
- Detects distribution imbalances
- Based on percentages, not absolute counts

### ✅ Over-Optimisation Detection
- Excessive Work: > 60% Work actions
- Excessive Saving: > 40% Save actions
- Excessive Learning: > 50% Learning + no Work/Exercise

### ✅ Penalty Application
- Deterministic (same action history = same penalties)
- Applied during weekly tick evaluation
- Logged as stat changes (via Cloud update)
- Enforces floors (stats cannot go below 0)

---

## Scope Compliance

### ✅ Over-Optimisation Penalties Only
- Work dominance penalty implemented
- Saving dominance penalty implemented
- Learning without execution penalty implemented

### ✅ No New Failure States
- No failure states added
- Only penalties applied

### ✅ No Burnout Logic Changes
- Burnout logic unchanged (Step 6 locked)
- Burnout tracking uses capacity after penalties

### ✅ No Decay Rules Changes
- Decay rates unchanged (Step 4 locked)
- Decay triggers unchanged
- Decay schedules unchanged

### ✅ No Action Cost Changes
- Energy costs unchanged (Step 2 locked)
- Action execution unchanged

### ✅ No Tick Logic Changes
- Daily tick logic unchanged (Step 3 locked)
- Only adds weekly evaluation check
- Tick application unchanged

### ✅ No UI Changes
- Frontend unchanged
- No new components
- No UI explanations
- No warnings

### ✅ No New Stats or Resources
- No new stats added
- No new resources added
- Uses existing stats (Capacity, Meaning, Optionality)

---

## Validation Checklist

From PHASE_1_EXECUTION.md Step 7 validation:

- ✅ **Penalties apply even if player is "winning"**
  - Penalties based on action distribution, not success/failure
  - Can penalize even when stats are high
  - Punishes fragile success (one-dimensional optimization)

- ✅ **Penalties are visible and logged**
  - Stat changes visible through API responses
  - Changes logged in database (Cloud update)
  - Deterministic (reproducible from action history)

- ✅ **Penalties do not instantly reverse**
  - Applied during weekly tick only
  - Requires 7 days for next evaluation
  - Cannot be instantly undone

---

## Example Scenarios

### Scenario 1: Excessive Work Dominance
- Past 7 days: 7 Work actions, 2 Exercise, 1 Learning (10 total)
- Work percentage: 70% (> 60% threshold)
- Penalties applied: Capacity -5, Meaning -3
- Even if Capacity is high (e.g., 80), it becomes 75

### Scenario 2: Excessive Saving Dominance
- Past 7 days: 5 Save actions, 3 Work, 2 Exercise (10 total)
- Save percentage: 50% (> 40% threshold)
- Penalties applied: Meaning -4
- Hoarding detected, Meaning reduced

### Scenario 3: Excessive Learning Without Execution
- Past 7 days: 6 Learning actions, 0 Work, 0 Exercise (6 total)
- Learning percentage: 100% (> 50% threshold)
- No Work/Exercise actions
- Penalties applied: Optionality -4
- Learning without application reduces Optionality

### Scenario 4: Multiple Imbalances
- Past 7 days: 8 Work actions, 2 Save actions (10 total)
- Work percentage: 80% (> 60%)
- Save percentage: 20% (not > 40%)
- Penalties applied: Capacity -5, Meaning -3
- Work dominance triggers both penalties

---

## Files Modified

1. **`apps/backend/prisma/schema.prisma`**
   - Added `lastWeeklyTickAt` field to User model

2. **`apps/backend/src/services/overOptimisationService.ts`** (NEW)
   - Action history analysis
   - Imbalance detection logic
   - Penalty calculation and application

3. **`apps/backend/src/services/tickService.ts`**
   - Integrated weekly tick evaluation into daily tick
   - Check for weekly tick boundary (7 days)
   - Apply over-optimisation penalties during weekly tick

---

## Next Steps

**Migration Required:**
- Run Prisma migration to add `lastWeeklyTickAt` field to User model
- `npx prisma migrate dev --name add_weekly_tick_tracking`
- Regenerate Prisma client: `npx prisma generate`

**Step 8: Lock UI truth source**

**Status:** ⏳ AWAITING APPROVAL

Do not proceed until explicitly approved.

---

## Approval Criteria

Step 7 is complete when:
- ✅ Over-optimisation penalties implemented (Work, Saving, Learning)
- ✅ Weekly tick evaluation implemented (every 7 days)
- ✅ Action history analysis implemented (past 7 days)
- ✅ Penalties are deterministic and logged
- ✅ Penalties apply even if player is "winning"
- ✅ Penalties do not instantly reverse
- ✅ No new failure states
- ✅ No Burnout logic changes
- ✅ No decay rules changed
- ✅ No action costs changed
- ✅ No tick logic changed (only adds weekly check)
- ✅ No UI changes
- ✅ No new stats or resources

**All criteria met.** ✅

