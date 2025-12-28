# Step 2: Action Path Audit - Complete

## Universal Action Cost Enforcement

**Status:** ✅ **COMPLETE**

**Date:** 2024-12-24

---

## Audit Results

### Actions Requiring Energy Enforcement

| Action Path | Route | Energy Enforced | Status |
|------------|-------|-----------------|--------|
| Main Activity | `POST /xp/activity` | ✅ Yes | ✅ COMPLIANT |
| Training Task | `POST /training/tasks/:taskId/complete` | ✅ Yes | ✅ COMPLIANT |
| Create Investment | `POST /investments` | ✅ Yes | ✅ **FIXED** |

---

## Fix Applied

### Investment Creation Route

**File:** `apps/backend/src/routes/investments.ts`

**Changes:**
1. ✅ Added `ensureDailyTick()` call before action
2. ✅ Added energy check using `getActionEnergyCost(ActivityType.CUSTOM)` (20 energy)
3. ✅ Added Capacity-based usable energy check
4. ✅ Deducts energy (20) when investment is created
5. ✅ Returns energy information in response
6. ✅ Fails with 400 error if insufficient energy

**Energy Cost:** 20 (CUSTOM action type)

---

## Verification

### All Action Paths Verified

#### ✅ Main Activity Route
- **Endpoint:** `POST /xp/activity`
- **Activity Types:** WORK_PROJECT, EXERCISE, SAVE_EXPENSES, LEARNING, CUSTOM
- **Energy Check:** ✅ Yes
- **Energy Deduction:** ✅ Yes
- **Capacity Modifier:** ✅ Yes

#### ✅ Training Task Completion
- **Endpoint:** `POST /training/tasks/:taskId/complete`
- **Activity Type:** LEARNING
- **Energy Cost:** 20
- **Energy Check:** ✅ Yes
- **Energy Deduction:** ✅ Yes
- **Capacity Modifier:** ✅ Yes

#### ✅ Investment Creation
- **Endpoint:** `POST /investments`
- **Activity Type:** CUSTOM
- **Energy Cost:** 20
- **Energy Check:** ✅ Yes (FIXED)
- **Energy Deduction:** ✅ Yes (FIXED)
- **Capacity Modifier:** ✅ Yes (FIXED)

---

## Out of Scope (Configuration/State Changes)

These paths do NOT create activity logs or award XP, so they're out of scope for Step 2:

- `POST /resources/transaction` - Manual resource editing (Step 8 scope)
- `PUT /clouds/:cloudType` - Manual stat editing (Step 8 scope)
- Engine CRUD operations - Configuration actions
- Season transitions - System state changes
- Admin endpoints - Administrative functions
- Questionnaire/Registration - Initialization actions

---

## Validation Checklist

Step 2 is complete when all are true:

- [x] Every action emits ResourceAdjusted (Energy) - ✅ All action paths deduct energy
- [x] Attempts beyond Energy cap fail deterministically - ✅ All paths check usable energy
- [x] No "free" actions remain - ✅ All XP-awarding actions require energy

---

## Testing Instructions

### Investment Creation Now Costs Energy

1. Start with 100 energy
2. Create an investment
3. Energy should decrease by 20 (CUSTOM cost)
4. If energy < 20, investment creation should fail with "Insufficient energy"
5. Energy is deducted even if gold check fails (energy check happens first)

### All Actions Require Energy

1. Try to perform any action:
   - Main activity (Work, Exercise, Learning, Save)
   - Training task completion
   - Investment creation
2. All should check energy before executing
3. All should deduct energy on success
4. All should fail if insufficient energy

### No Free Actions

1. Verify investment creation costs energy (was previously free)
2. Verify training tasks cost energy (fixed in Step 2)
3. Verify main activities cost energy (Step 1)
4. No action that awards XP should succeed without energy check

---

## Summary

**All player actions that create activity logs and award XP now require energy.**

- ✅ 3 action paths identified and verified
- ✅ 1 bypass found and fixed (investment creation)
- ✅ 0 free actions remain
- ✅ All paths enforce energy costs
- ✅ All paths apply Capacity modifiers
- ✅ All paths fail deterministically when energy insufficient

**Step 2: Universal Action Cost Enforcement - ✅ COMPLETE**

