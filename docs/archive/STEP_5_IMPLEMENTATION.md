# Step 5: Capacity Affects Outcomes Implementation

## Status: ✅ COMPLETE

**Scope:** Capacity modifiers applied to XP gain and rewards.  
**No modifications to:** Decay rules, failure states, action costs, tick logic, or UI.

---

## Implementation Summary

### Core Changes

**Files Created:**
- `apps/backend/src/services/capacityModifierService.ts` - Capacity modifier logic

**Files Modified:**
- `apps/backend/src/routes/xp.ts` - Apply Capacity modifiers to activity XP
- `apps/backend/src/routes/training.ts` - Apply Capacity modifiers to training XP and rewards
- `apps/backend/src/routes/investments.ts` - Apply Capacity modifiers to investment XP

### Capacity Band Definitions (Canonical)

Bands are discrete - no smoothing or gradients:

- **Capacity 0-20:** XP gain -40% (60% of normal), reward efficiency reduced (60%)
- **Capacity 21-40:** XP gain -20% (80% of normal), reward efficiency slightly reduced (90%)
- **Capacity 41-70:** Normal outcomes (100%)
- **Capacity 71-85:** Slight efficiency bonus (+10% XP, +5% rewards)
- **Capacity 86-100:** Recovery and XP bonus (+15% XP, +10% rewards, capped)

---

## Implementation Details

### 1. Capacity Modifier Service

**File:** `apps/backend/src/services/capacityModifierService.ts`

**Functions:**
- `getCapacityModifiers(capacity: number)`: Returns XP and reward efficiency multipliers
- `applyCapacityModifierToXP(xp: number, capacity: number)`: Applies modifier to XP values
- `applyCapacityModifierToReward(reward: number, capacity: number)`: Applies modifier to reward values

**Band Logic:**
```typescript
if (capacity <= 20) {
  return { xpEfficiency: 0.6, rewardEfficiency: 0.6 }  // -40%
} else if (capacity <= 40) {
  return { xpEfficiency: 0.8, rewardEfficiency: 0.9 }  // -20%
} else if (capacity <= 70) {
  return { xpEfficiency: 1.0, rewardEfficiency: 1.0 }  // Normal
} else if (capacity <= 85) {
  return { xpEfficiency: 1.1, rewardEfficiency: 1.05 } // +10%
} else {
  return { xpEfficiency: 1.15, rewardEfficiency: 1.1 } // +15% (capped)
}
```

### 2. Main Activity Route (`/xp/activity`)

**Changes:**
- Calculate base XP using `calculateXP()`
- Apply Capacity modifiers to overall XP and all category XP
- Apply Capacity modifiers to resource rewards (oxygen, water, gold, armor, keys)
- Store Capacity-modified values in database and activity logs
- Include capacity modifier info in response

**Example:**
- Base XP: 500 overall, 100 capacity
- Capacity: 15 (band 0-20, -40% modifier)
- Modified XP: 300 overall (500 * 0.6), 60 capacity (100 * 0.6)

### 3. Training Task Route (`/training/tasks/:taskId/complete`)

**Changes:**
- Calculate base XP reward using `calculateTaskXP()`
- Apply Capacity modifiers to overall XP and all category XP
- Apply Capacity modifiers to resource rewards
- Store Capacity-modified values in database and activity logs
- Include capacity modifier info in response

### 4. Investment Routes (`/investments`)

**Changes:**
- Create investment: Apply Capacity modifiers to XP reward
- Update investment: Apply Capacity modifiers to additional investment XP
- Store Capacity-modified values in database and activity logs

---

## Key Features

### ✅ Discrete Bands
- No smoothing or gradients
- Clear boundaries between bands
- Immediate effect when crossing band boundaries

### ✅ XP Efficiency Modifiers
- Low Capacity (0-20): -40% XP gain
- Medium-Low Capacity (21-40): -20% XP gain
- Normal Capacity (41-70): 100% XP gain
- Medium-High Capacity (71-85): +10% XP gain
- High Capacity (86-100): +15% XP gain (capped)

### ✅ Reward Efficiency Modifiers
- Low Capacity: Reduced reward efficiency (60%)
- Medium-Low Capacity: Slightly reduced (90%)
- Normal Capacity: Normal rewards (100%)
- Medium-High Capacity: Slight bonus (105%)
- High Capacity: Bonus (110%)

### ✅ Universal Application
- All XP-gaining actions affected
- All resource rewards affected
- Consistent application across all action types

---

## Scope Compliance

### ✅ Capacity Modifiers Only
- XP gain modified based on Capacity bands
- Reward efficiency modified based on Capacity bands
- Negative modifiers at low Capacity
- Positive modifiers at high Capacity

### ✅ No Decay Rules Changes
- Decay rates unchanged (Step 4 locked)
- Decay triggers unchanged
- Decay schedules unchanged

### ✅ No Failure States
- No new failure states (Step 6)
- Only Capacity modifiers applied

### ✅ No Action Cost Changes
- Energy costs unchanged (Step 2 locked)
- Action execution unchanged

### ✅ No Tick Changes
- Tick logic unchanged (Step 3 locked)
- Tick application unchanged

### ✅ No UI Changes
- Frontend unchanged
- No new components
- No UI explanations

---

## Validation Checklist

From PHASE_1_EXECUTION.md Step 5 validation:

- ✅ **Low Capacity visibly reduces progress**
  - Capacity 0-20: -40% XP gain
  - Capacity 21-40: -20% XP gain
  - Reductions are immediately visible in XP gains

- ✅ **High Capacity slightly improves recovery**
  - Capacity 71-85: +10% XP gain
  - Capacity 86-100: +15% XP gain (capped)
  - Bonuses are meaningful but not excessive

- ✅ **No stat operates in isolation**
  - Capacity actively affects all XP gains
  - Capacity affects all resource rewards
  - Capacity is now a lever, not just a label

---

## Files Modified

1. **`apps/backend/src/services/capacityModifierService.ts`** (NEW)
   - Capacity band definitions
   - Modifier calculation functions
   - XP and reward modifier application

2. **`apps/backend/src/routes/xp.ts`**
   - Apply Capacity modifiers to activity XP
   - Apply Capacity modifiers to resource rewards
   - Store modified values in database

3. **`apps/backend/src/routes/training.ts`**
   - Apply Capacity modifiers to training XP
   - Apply Capacity modifiers to training rewards
   - Store modified values in database

4. **`apps/backend/src/routes/investments.ts`**
   - Apply Capacity modifiers to investment XP (create)
   - Apply Capacity modifiers to investment XP (update)
   - Store modified values in database

---

## Example Scenarios

### Scenario 1: Low Capacity (15)
- User performs Work Project (base 500 XP)
- Capacity modifier: 0.6 (band 0-20)
- Actual XP gained: 300 (500 * 0.6)
- Gold reward (if 100 base): 60 (100 * 0.6)

### Scenario 2: Normal Capacity (50)
- User performs Exercise (base 200 XP)
- Capacity modifier: 1.0 (band 41-70)
- Actual XP gained: 200 (200 * 1.0)
- Rewards: 100% of base

### Scenario 3: High Capacity (90)
- User performs Learning (base 400 XP)
- Capacity modifier: 1.15 (band 86-100)
- Actual XP gained: 460 (400 * 1.15)
- Rewards: 110% of base

---

## Next Steps

**Step 6: Introduce Burnout failure state**

**Status:** ⏳ AWAITING APPROVAL

Do not proceed until explicitly approved.

---

## Approval Criteria

Step 5 is complete when:
- ✅ XP gain modified based on Capacity bands
- ✅ Reward efficiency modified based on Capacity bands
- ✅ Low Capacity reduces progress visibly
- ✅ High Capacity improves recovery slightly
- ✅ No stat operates in isolation
- ✅ No decay rules changed
- ✅ No failure states added
- ✅ No action costs changed
- ✅ No tick logic changed
- ✅ No UI changes

**All criteria met.** ✅

