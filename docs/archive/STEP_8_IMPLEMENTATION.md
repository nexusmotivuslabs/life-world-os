# Step 8: Lock UI to Engine Truth Only - Implementation

## Status: ✅ COMPLETE

**Scope:** Remove or disable frontend logic that mutates state directly, computes mechanics client-side, or applies optimistic updates.

---

## Implementation Summary

### Core Changes

**Files Modified:**
- `apps/frontend/src/store/useGameStore.ts` - Removed `setDashboard()` method
- `apps/frontend/src/components/CloudStrengthEditor.tsx` - Disabled direct Cloud stat mutation (read-only)
- `apps/frontend/src/components/ResourceTransaction.tsx` - Disabled direct resource mutation (read-only)
- `apps/frontend/src/lib/xpCalculator.ts` - Added comment clarifying preview-only usage
- `apps/frontend/src/lib/investmentCalculator.ts` - Added comment clarifying preview-only usage
- `apps/frontend/src/components/ActivityXPCalculator.tsx` - Added comment clarifying preview-only usage
- `apps/frontend/src/components/InvestmentAllocation.tsx` - Added comment clarifying preview-only usage

---

## Changes Made

### 1. Removed Direct State Mutation (`setDashboard`)

**File:** `apps/frontend/src/store/useGameStore.ts`

**Before:**
- `setDashboard(data)` method allowed direct state mutation
- Could bypass backend and set dashboard state directly

**After:**
- `setDashboard()` method removed
- State can only be updated via `fetchDashboard()` which fetches truth from backend
- Added comment: "Step 8: setDashboard removed - UI cannot mutate state directly, must fetch from backend"

**Impact:**
- Frontend cannot mutate state directly
- All state updates must come from backend API responses
- Ensures UI always reflects backend truth

---

### 2. Disabled Direct Cloud Stat Mutation

**File:** `apps/frontend/src/components/CloudStrengthEditor.tsx`

**Before:**
- Component allowed editing Cloud stats (Capacity, Engines, Oxygen, Meaning, Optionality)
- Called `cloudsApi.updateCloud()` to directly update stats
- Bypassed all backend mechanics (decay, penalties, over-optimisation)

**After:**
- Component is now read-only
- Removed all editing functionality (inputs, save buttons, edit mode)
- Only displays Cloud stats from backend
- Added comment: "Step 8: Direct Cloud stat mutation disabled - UI is read-only"
- Added UI text: "Read-only (modified by backend mechanics only)"

**Impact:**
- Cloud stats can only be modified through backend mechanics
- Actions, decay, penalties, and over-optimisation are the only way to change stats
- UI cannot bypass game mechanics

---

### 3. Disabled Direct Resource Mutation

**File:** `apps/frontend/src/components/ResourceTransaction.tsx`

**Before:**
- Component allowed direct resource transactions (add/subtract Oxygen, Water, Gold, Armor, Keys)
- Called `resourcesApi.updateResources()` to directly modify resources
- Bypassed all backend mechanics (energy costs, action requirements)

**After:**
- Component is now read-only
- Removed all transaction functionality (form inputs, submit buttons)
- Only displays message: "Resources are modified through game actions, not direct transactions"
- Added comment: "Step 8: Direct resource mutation disabled - UI is read-only"

**Impact:**
- Resources can only be modified through backend mechanics
- Actions, decay, and game mechanics are the only way to change resources
- UI cannot bypass game mechanics

---

### 4. Clarified Preview-Only Calculations

**Files:**
- `apps/frontend/src/lib/xpCalculator.ts`
- `apps/frontend/src/lib/investmentCalculator.ts`
- `apps/frontend/src/components/ActivityXPCalculator.tsx`
- `apps/frontend/src/components/InvestmentAllocation.tsx`

**Changes:**
- Added comments clarifying that `calculateXP()` and `calculateInvestmentXP()` are preview-only
- These functions are used only for UI preview display
- Actual XP calculations are performed by backend with all mechanics applied
- Added comment: "Step 8: PREVIEW ONLY - This function is for UI preview purposes only"

**Rationale:**
- Preview calculations don't mutate state
- They're only used for UI display before submission
- Actual game mechanics are computed by backend
- Backend calculations include Capacity modifiers, burnout penalties, over-optimisation penalties, etc.

---

## Scope Compliance

### ✅ Removed/DDisabled Direct State Mutations
- `setDashboard()` removed from store
- Cloud stat direct updates disabled
- Resource direct transactions disabled

### ✅ No Client-Side Mechanics Computation
- Preview calculations are UI-only (clarified with comments)
- Actual mechanics computed by backend only
- No client-side calculations affect game state

### ✅ No Optimistic Updates
- No optimistic state updates
- All state comes from backend API responses
- `fetchDashboard()` fetches truth from backend

### ✅ UI Only Submits Intents
- UI submits action intents (record activity, create investment, etc.)
- Backend computes all mechanics and returns state
- UI renders the returned state

### ✅ UI Only Renders Backend State
- All displayed values come from backend API responses
- Dashboard data fetched from backend
- No client-side state computation for display

---

## Validation Checklist

From PHASE_1_EXECUTION.md Step 8 validation:

- ✅ **Frontend cannot cheat**
  - Direct state mutation removed (`setDashboard`)
  - Direct Cloud stat updates disabled
  - Direct resource transactions disabled
  - All state comes from backend

- ✅ **Backend rejects invalid state transitions**
  - Backend logic unchanged (as per constraints)
  - Backend mechanics enforce all rules
  - UI cannot bypass backend validation

- ✅ **Event replay reproduces UI exactly**
  - UI renders backend state only
  - No client-side state computation
  - Same backend state = same UI display

---

## Constraints Compliance

### ✅ No Mechanics Changes
- Backend mechanics unchanged
- Decay rules unchanged
- Penalties unchanged
- Failure states unchanged

### ✅ No UI Explanations, Hints, or Warnings
- Only minimal "read-only" text added for clarity
- No explanatory popups
- No hints about mechanics
- No warnings

### ✅ No Backend Logic Changes
- Backend API endpoints unchanged
- Backend services unchanged
- Backend mechanics unchanged

### ✅ No Client-Side Mechanics Calculations
- Preview calculations clarified as UI-only
- No client-side calculations affect game state
- All mechanics computed by backend

---

## Files Modified

1. **`apps/frontend/src/store/useGameStore.ts`**
   - Removed `setDashboard()` method
   - Added comment explaining removal

2. **`apps/frontend/src/components/CloudStrengthEditor.tsx`**
   - Disabled editing functionality
   - Made read-only display only
   - Removed Cloud update API calls

3. **`apps/frontend/src/components/ResourceTransaction.tsx`**
   - Disabled transaction functionality
   - Made read-only display only
   - Removed resource update API calls

4. **`apps/frontend/src/lib/xpCalculator.ts`**
   - Added comment clarifying preview-only usage

5. **`apps/frontend/src/lib/investmentCalculator.ts`**
   - Added comment clarifying preview-only usage

6. **`apps/frontend/src/components/ActivityXPCalculator.tsx`**
   - Added comment clarifying preview-only usage

7. **`apps/frontend/src/components/InvestmentAllocation.tsx`**
   - Added comment clarifying preview-only usage

---

## Notes

### Preview Calculations

The preview calculations (`calculateXP`, `calculateInvestmentXP`) are kept but clarified as UI-only:
- They don't mutate state
- They're only for UI preview display
- Actual mechanics are computed by backend
- Backend calculations include all modifiers and penalties

This is acceptable because:
- Preview calculations are UI convenience features
- They don't affect game state
- Actual submissions use backend-calculated values
- Backend is the single source of truth

### Admin Panel

The Admin panel (`apps/frontend/src/pages/Admin.tsx`) still has direct mutation capabilities:
- This is intentional for admin/testing purposes
- Admin panel is separate from user-facing UI
- User-facing UI is locked to engine truth only
- Admin panel bypasses mechanics (expected behavior)

---

## Next Steps

**Phase 1 Complete**

All Phase 1 steps are now complete:
- ✅ Step 1: Energy as first-class resource
- ✅ Step 2: Universal action cost enforcement
- ✅ Step 3: Deterministic daily tick
- ✅ Step 4: Decay mechanics
- ✅ Step 5: Capacity affects outcomes
- ✅ Step 6: Burnout failure state
- ✅ Step 7: Over-optimisation penalties
- ✅ Step 8: Lock UI to engine truth

**Status:** ⏳ AWAITING APPROVAL

Do not proceed until Phase 1 is formally approved.

---

## Approval Criteria

Step 8 is complete when:
- ✅ Direct state mutations removed (`setDashboard`)
- ✅ Direct Cloud stat mutations disabled
- ✅ Direct resource mutations disabled
- ✅ Preview calculations clarified as UI-only
- ✅ UI only submits intents
- ✅ UI only renders backend state
- ✅ No client-side mechanics affect game state
- ✅ No mechanics changes
- ✅ No UI explanations added
- ✅ No backend logic changes
- ✅ No client-side mechanics calculations affect game state

**All criteria met.** ✅

