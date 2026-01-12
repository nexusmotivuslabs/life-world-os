# UI Alignment Report — Phase 1 Truth Alignment Pass

**Date:** 2024-12-24  
**Status:** COMPLETE

---

## Objective

Align existing UI with Phase 1 mechanics so it does not contradict or misrepresent system truth.

This is NOT a UI refactor — only a truth-alignment adapter pass.

---

## UI Contradictions Found and Fixed

### 1. ✅ Burnout State Not Displayed
**Contradiction:** Backend provides `isInBurnout` in dashboard response, but UI did not display burnout state.

**Fix Applied:**
- Added `isInBurnout?: boolean` to `DashboardData` interface
- Added burnout warning banner in Energy section when `isInBurnout` is true
- Updated `EnergyCard` component to accept and display `isInBurnout` prop
- Updated energy description to mention burnout cap reduction when in burnout

**Files Modified:**
- `apps/frontend/src/types/index.ts` - Added `isInBurnout` to `DashboardData`
- `apps/frontend/src/pages/Dashboard.tsx` - Added burnout warning display
- `apps/frontend/src/components/EnergyCard.tsx` - Added burnout prop and display

**Impact:** Users can now see when they are in burnout state.

---

### 2. ✅ Decay Not Acknowledged
**Contradiction:** UI shows stat values but doesn't indicate that decay occurs automatically.

**Fix Applied:**
- Added minimal text below Cloud stats: "Stats can decay over time if neglected. Modified by actions, decay, and penalties."

**Files Modified:**
- `apps/frontend/src/pages/Dashboard.tsx` - Added decay acknowledgment text

**Impact:** Users are aware that stats can decay, aligning UI with backend mechanics.

---

## UI Contradictions Neutralized (Already Acceptable)

### 3. ✅ Energy Limits Correctly Displayed
**Status:** EnergyCard correctly shows usable energy, cap, and Capacity effects.

**Action:** No change needed.

---

### 4. ✅ Action Failure Shows Energy Requirements
**Status:** QuickActions error handling correctly shows energy requirements when actions fail.

**Action:** No change needed.

---

### 5. ✅ Energy Description Mentions Capacity
**Status:** Description mentions "Capacity modifies your usable energy cap."

**Action:** Enhanced to also mention burnout when applicable.

---

## Acceptable Omissions (Intentionally Left Unresolved)

### 6. Capacity Modifier Efficiency Not Displayed in Action Results
**Reason:** Backend provides `capacityModifier` in action responses, but displaying it would require parsing and formatting response data. The effects are visible through actual XP/reward values received.

**Status:** Acceptable to omit for now. Effects are visible through outcomes.

---

### 7. Over-Optimisation Penalties Not Explicitly Labeled
**Reason:** Weekly penalties are mechanical consequences that affect visible stats. Users can see stat changes, even if the source (over-optimisation) isn't explicitly labeled.

**Status:** Acceptable. Penalties affect visible stats which are displayed.

---

### 8. Decay Rate Details Not Shown
**Reason:** Decay is automatic backend mechanic. Showing specific rates would be explanation/coaching, which is forbidden.

**Status:** Acceptable. Minimal acknowledgment added without details.

---

### 9. Action Energy Costs Not Shown Before Clicking
**Reason:** Would require client-side cost lookup or pre-call to backend. Current implementation shows costs after failure, which is acceptable.

**Status:** Acceptable. Error handling shows requirements on failure.

---

## Summary of Changes

**Total Fixes Applied:** 2

1. **Burnout state display** - Critical fix to show failure state
2. **Decay acknowledgment** - Minimal text to acknowledge decay mechanics

**Files Modified:** 3
- `apps/frontend/src/types/index.ts`
- `apps/frontend/src/pages/Dashboard.tsx`
- `apps/frontend/src/components/EnergyCard.tsx`

**Lines Changed:** ~15 lines total

**Forbidden Actions Avoided:**
- ✅ No client-side mechanics calculations
- ✅ No UI explanations or coaching beyond minimal acknowledgment
- ✅ No visual design changes
- ✅ No layout refactoring
- ✅ No backend logic changes

---

## Validation

The UI now truthfully represents:

- ✅ **Energy limits** - Displayed correctly, including Capacity and Burnout caps
- ✅ **Capacity strain** - Energy cap reflects Capacity (visible through usable energy)
- ✅ **Decay** - Acknowledged in Cloud stats section
- ✅ **Burnout** - Displayed when active with clear indication of effects
- ✅ **Time progression** - Daily ticks implicit in energy reset description
- ✅ **Action costs** - Shown on failure (acceptable for Phase 1)

---

## Remaining Known Misalignments

1. **Capacity modifier efficiency not displayed** - Acceptable (effects visible through outcomes)
2. **Over-optimisation penalties not labeled** - Acceptable (affect visible stats)
3. **Action energy costs not pre-displayed** - Acceptable (shown on failure)
4. **Decay rates not detailed** - Acceptable (would be coaching/explanation)

---

## Conclusion

**Phase 1 UI alignment complete.**

All critical contradictions removed. Remaining omissions are acceptable per Phase 1 scope constraints.

The UI is now a truthful projection of backend state without adding comfort, explanations, or client-side calculations.

---

**Status:** ✅ ALIGNMENT PASS COMPLETE

**Ready for:** Phase 2 or further development as approved.





