# Step 7: Over-Optimisation Penalties — Formal Approval

## Validation Checklist

### ✅ 1. Penalties are applied only on weekly evaluation
**Status:** CONFIRMED

Penalties are only applied when `shouldEvaluateWeekly` is true, which occurs when:
- 7 days have passed since `lastWeeklyTickAt` (or account creation for first evaluation)
- Evaluated during daily tick, but applied only at weekly boundary

**Code Location:** `apps/backend/src/services/tickService.ts` lines 124-139

```typescript
// Step 7: Evaluate and apply over-optimisation penalties during weekly tick
if (shouldEvaluateWeekly) {
  const penalties = await evaluateOverOptimisationPenalties(userId, tickDate)
  const adjustedStats = await applyOverOptimisationPenalties(...)
  // Apply penalties
}
```

---

### ✅ 2. Imbalance is computed from action distribution over time, not single actions
**Status:** CONFIRMED

Imbalance detection analyzes action history from the past 7 days:
- `analyzeActionDistribution()` queries all actions from `weekStartDate` to `weekEndDate` (7-day window)
- Counts are aggregated across the entire week
- Percentages calculated from total counts, not single actions

**Code Location:** `apps/backend/src/services/overOptimisationService.ts` lines 43-111

```typescript
async function analyzeActionDistribution(
  userId: string,
  weekStartDate: Date,
  weekEndDate: Date
): Promise<{ workCount, saveCount, learningCount, exerciseCount, totalCount }>
```

---

### ✅ 3. Excessive patterns map exactly to canonical penalties
**Status:** CONFIRMED

All penalties match canonical requirements exactly:

- **Work dominance (>60%)** → Capacity -5, Meaning -3
  - `EXCESSIVE_WORK_CAPACITY_PENALTY: -5`
  - `EXCESSIVE_WORK_MEANING_PENALTY: -3`

- **Saving dominance (>40%)** → Meaning -4
  - `EXCESSIVE_SAVING_MEANING_PENALTY: -4`

- **Learning without execution (>50%, no Work/Exercise)** → Optionality -4
  - `EXCESSIVE_LEARNING_OPTIONALITY_PENALTY: -4`

**Code Location:** `apps/backend/src/services/overOptimisationService.ts` lines 17-28, 184-207

---

### ✅ 4. Penalties are deterministic and event-logged
**Status:** CONFIRMED

- **Deterministic:** Same action history always produces same penalties (based on percentage thresholds)
- **Event-logged:** Stat changes are persisted via Cloud database update in transaction

**Code Location:** 
- Penalty evaluation: `apps/backend/src/services/overOptimisationService.ts` lines 169-207
- Database update: `apps/backend/src/services/tickService.ts` lines 174-182

```typescript
await tx.cloud.update({
  where: { userId },
  data: {
    capacityStrength: newCapacity,
    meaningStrength: newMeaning,
    optionalityStrength: currentOptionality,
  },
})
```

---

### ✅ 5. No new failure states were introduced
**Status:** CONFIRMED

- Only penalties applied to existing stats (Capacity, Meaning, Optionality)
- No new failure state tracking fields added
- No new failure state logic introduced
- Over-optimisation penalties are stat adjustments, not failure states

**Verification:** Only `lastWeeklyTickAt` field added to User model (for tracking evaluation timing, not a failure state)

---

### ✅ 6. Burnout logic was not modified
**Status:** CONFIRMED

- Burnout service unchanged
- Burnout tracking logic unchanged
- Only addition: burnout tracking uses capacity after over-optimisation penalties (correct behavior)
- No modifications to burnout trigger, recovery, or penalty logic

**Code Location:** `apps/backend/src/services/tickService.ts` lines 141-161 (unchanged from Step 6)

---

### ✅ 7. Daily tick logic was not modified
**Status:** CONFIRMED

- Daily tick application logic unchanged
- Tick replay logic unchanged
- Idempotency checks unchanged
- Energy reset logic unchanged
- Only addition: weekly evaluation check (does not modify daily tick behavior)

**Verification:** Daily tick flow remains:
1. Check idempotency
2. Apply decay
3. **NEW:** Check for weekly evaluation (if yes, apply penalties)
4. Update burnout tracking
5. Apply all changes in transaction

---

### ✅ 8. No UI hints, warnings, or softeners were added
**Status:** CONFIRMED

- No frontend changes
- No new components
- No UI messages, warnings, or hints
- No explanatory text
- Penalties are mechanical, applied silently
- Stats changes visible only through normal API responses

**Verification:** No files in `apps/frontend/` modified

---

## All Validation Items: ✅ CONFIRMED

---

## Formal Approval

**Step 7 approved.**

Over-optimisation penalties are complete and locked.

Weekly imbalance detection and penalties are now canonical.

Do not modify penalty thresholds, values, or evaluation timing.

Await approval before proceeding to Step 8.

---

## Implementation Summary

**Files Created:**
- `apps/backend/src/services/overOptimisationService.ts`

**Files Modified:**
- `apps/backend/prisma/schema.prisma` (added `lastWeeklyTickAt`)
- `apps/backend/src/services/tickService.ts` (added weekly evaluation check)

**Canonical Penalties:**
- Excessive Work (>60%): Capacity -5, Meaning -3
- Excessive Saving (>40%): Meaning -4
- Excessive Learning (>50%, no Work/Exercise): Optionality -4

**Evaluation Timing:**
- Weekly tick boundary (every 7 days)
- Based on `lastWeeklyTickAt` tracking
- Integrated into daily tick system

---

**Status:** ✅ APPROVED AND LOCKED

**Next Step:** Step 8 — Lock UI truth source (awaiting approval)

