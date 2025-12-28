# UI Alignment Audit — Phase 1 Truth Alignment

## Audit Date
2024-12-24

## Objective
Identify UI contradictions with Phase 1 mechanics and fix them to ensure UI truthfully represents backend state.

---

## Contradictions Found

### 1. ❌ Burnout State Not Displayed
**Issue:** Backend provides `isInBurnout` in dashboard response, but UI does not display burnout state.

**Impact:** Users cannot see when they are in burnout, making the failure state invisible.

**Fix:** Add burnout status display to Dashboard when `isInBurnout` is true.

**Status:** TO FIX

---

### 2. ❌ Capacity Modifier Effects Not Visible
**Issue:** Backend applies Capacity modifiers to XP and rewards, but UI does not show these modifiers in action results or stat displays.

**Impact:** Users cannot see how Capacity affects their outcomes, making the lever invisible.

**Fix:** Display Capacity modifier information when available in action responses (already provided in backend response).

**Status:** MINIMAL FIX - Only show if backend provides it in response

---

### 3. ⚠️ Action Energy Costs Not Shown Before Action
**Issue:** QuickActions and ActivityXPCalculator don't show energy costs before user clicks.

**Impact:** Users don't know if they have enough energy until they try and fail.

**Fix:** Display energy costs on action buttons (but only if costs are available client-side without backend call).

**Status:** PARTIALLY ACCEPTABLE - Error handling shows costs after failure

---

### 4. ⚠️ Decay Not Visibly Indicated
**Issue:** UI shows stat values but doesn't indicate that decay occurs automatically.

**Impact:** Users may not understand that stats degrade over time if neglected.

**Fix:** Minimal text indicating stats are affected by decay (no calculations, just acknowledgment).

**Status:** MINIMAL FIX - Add text only, no calculations

---

### 5. ⚠️ Over-Optimisation Penalties Not Visible
**Issue:** Weekly penalties are applied but not displayed to users.

**Impact:** Users cannot see when penalties are applied.

**Fix:** This is acceptable - penalties are mechanical consequences, not required to be displayed immediately (they affect stats which are visible).

**Status:** ACCEPTABLE - Penalties affect visible stats

---

### 6. ✅ Energy Limits Correctly Displayed
**Status:** EnergyCard correctly shows usable energy, cap, and Capacity effects.

---

### 7. ✅ Energy Description Mentions Capacity
**Status:** Description mentions "Capacity modifies your usable energy cap."

**Note:** Could mention burnout cap reduction if in burnout.

---

### 8. ✅ Action Failure Shows Energy Requirements
**Status:** QuickActions error handling correctly shows energy requirements when actions fail.

---

## Fixes to Apply

### Fix 1: Display Burnout State
- Add `isInBurnout` to DashboardData type
- Display burnout indicator when `isInBurnout` is true
- Show in Energy section (burnout reduces energy cap)

### Fix 2: Update Energy Description for Burnout
- When in burnout, update energy description to mention burnout cap reduction

### Fix 3: Add Minimal Decay Acknowledgment
- Add text to Cloud stats section indicating stats can decay
- No calculations, just acknowledgment

---

## Forbidden Actions (Not Applied)
- ❌ No client-side energy cost calculations
- ❌ No client-side Capacity modifier calculations  
- ❌ No UI explanations or coaching
- ❌ No visual design changes
- ❌ No layout refactoring

---

## Remaining Known Misalignments (Intentionally Left)

1. **Capacity modifier efficiency not displayed in action results** - Backend provides it, but displaying it would require parsing response. Acceptable to leave as-is for now.

2. **Over-optimisation penalties not explicitly labeled** - Penalties affect stats which are visible. Acceptable.

3. **Decay rate details not shown** - Decay is automatic, rates are backend mechanics. Acceptable.

4. **Action energy costs not shown before clicking** - Would require client-side cost lookup. Acceptable to show after failure for now.

---

## Summary

**Critical Fixes:** 1 (Burnout display)
**Minimal Fixes:** 2 (Energy description update, decay acknowledgment)
**Acceptable Omissions:** 4 (listed above)

Total fixes: 3 minimal changes to align truth.


