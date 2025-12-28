# Step 2: Action Path Audit

## Universal Action Cost Enforcement Audit

**Purpose:** Identify and eliminate all remaining free or implicit action paths that bypass energy costs.

**Scope:** Only energy enforcement. Do NOT modify decay, ticks, or stat behavior.

---

## Action Path Inventory

### ✅ 1. Main Activity Route (`POST /xp/activity`)

**File:** `apps/backend/src/routes/xp.ts`

**Action Types:** WORK_PROJECT, EXERCISE, SAVE_EXPENSES, LEARNING, CUSTOM

**Creates Activity Log:** ✅ Yes

**Awards XP:** ✅ Yes

**Energy Enforcement:** ✅ **ENFORCED**
- Energy check before action
- Energy deducted on success
- Capacity modifier applied
- Fails if insufficient energy

**Status:** ✅ COMPLIANT

---

### ✅ 2. Training Task Completion (`POST /training/tasks/:taskId/complete`)

**File:** `apps/backend/src/routes/training.ts`

**Action Type:** LEARNING (via ActivityType.LEARNING)

**Creates Activity Log:** ✅ Yes

**Awards XP:** ✅ Yes

**Energy Enforcement:** ✅ **ENFORCED**
- Energy check before action (20 energy for LEARNING)
- Energy deducted on success
- Capacity modifier applied
- Fails if insufficient energy

**Status:** ✅ COMPLIANT (Fixed in Step 2)

---

### ❌ 3. Create Investment (`POST /investments`)

**File:** `apps/backend/src/routes/investments.ts`

**Action Type:** CUSTOM (via ActivityType.CUSTOM)

**Creates Activity Log:** ✅ Yes

**Awards XP:** ✅ Yes

**Energy Enforcement:** ❌ **NOT ENFORCED** - BYPASS FOUND

**Issue:**
- Creates activity log with XP rewards
- Awards XP (overall and category)
- Modifies resources (deducts gold)
- **NO energy check or deduction**

**Status:** ❌ **REQUIRES FIX**

---

### 4. Resource Transaction (`POST /resources/transaction`)

**File:** `apps/backend/src/routes/resources.ts`

**Action Type:** N/A (manual resource adjustment)

**Creates Activity Log:** ❌ No

**Awards XP:** ❌ No

**Energy Enforcement:** N/A (not a player action, direct state modification)

**Note:** This is manual resource editing. Step 8 (UI locked to engine truth) will address this. For Step 2 scope (actions that award XP/create logs), this is excluded.

**Status:** ⚠️ OUT OF SCOPE (Step 8 will handle)

---

### 5. Admin Resource Update (`PUT /resources/admin`)

**File:** `apps/backend/src/routes/resources.ts`

**Action Type:** N/A (admin override)

**Creates Activity Log:** ❌ No

**Awards XP:** ❌ No

**Energy Enforcement:** N/A (admin function, not player action)

**Status:** ✅ OUT OF SCOPE (admin function)

---

### 6. Engine CRUD Operations (`POST/PUT/DELETE /engines`)

**File:** `apps/backend/src/routes/engines.ts`

**Action Type:** N/A (configuration, not gameplay action)

**Creates Activity Log:** ❌ No

**Awards XP:** ❌ No

**Energy Enforcement:** N/A (configuration actions, not gameplay actions)

**Status:** ✅ OUT OF SCOPE (configuration, not actions)

---

### 7. Season Transition (`POST /seasons/transition`)

**File:** `apps/backend/src/routes/seasons.ts`

**Action Type:** N/A (season change, not gameplay action)

**Creates Activity Log:** ❌ No (creates SeasonHistory, not ActivityLog)

**Awards XP:** ❌ No

**Energy Enforcement:** N/A (season change, not gameplay action)

**Status:** ✅ OUT OF SCOPE (system state change, not action)

---

### 8. Cloud Strength Update (`PUT /clouds/:cloudType`)

**File:** `apps/backend/src/routes/clouds.ts`

**Action Type:** N/A (stat editing)

**Creates Activity Log:** ❌ No

**Awards XP:** ❌ No

**Energy Enforcement:** N/A (direct stat editing)

**Note:** This is manual stat editing. Step 8 (UI locked to engine truth) will address this. For Step 2 scope, this is excluded.

**Status:** ⚠️ OUT OF SCOPE (Step 8 will handle)

---

### 9. Questionnaire Submission (`POST /questionnaire/submit`)

**File:** `apps/backend/src/routes/questionnaire.ts`

**Action Type:** N/A (initialization, one-time setup)

**Creates Activity Log:** ❌ No

**Awards XP:** ❌ No (sets initial XP, doesn't award)

**Energy Enforcement:** N/A (initialization, not gameplay action)

**Status:** ✅ OUT OF SCOPE (initialization, not action)

---

### 10. User Registration/Auth (`POST /auth/register`, etc.)

**File:** `apps/backend/src/routes/auth.ts`

**Action Type:** N/A (authentication, not gameplay)

**Creates Activity Log:** ❌ No

**Awards XP:** ❌ No

**Energy Enforcement:** N/A (authentication, not gameplay action)

**Status:** ✅ OUT OF SCOPE (authentication, not action)

---

## Summary

### Actions Requiring Energy Enforcement

1. ✅ Main Activity Route - **ENFORCED**
2. ✅ Training Task Completion - **ENFORCED** (fixed)
3. ❌ Create Investment - **REQUIRES FIX**

### Configuration/State Changes (Out of Scope for Step 2)

- Resource transactions (manual editing - Step 8 scope)
- Cloud strength updates (manual editing - Step 8 scope)
- Engine CRUD (configuration)
- Season transitions (system state change)
- Admin functions
- Initialization (questionnaire, registration)

---

## Fix Required

### Investment Creation Route

**Issue:** Creates activity log, awards XP, but bypasses energy check.

**Fix:** Add energy enforcement:
1. Check energy before creating investment (CUSTOM = 20 energy)
2. Deduct energy on success
3. Fail if insufficient energy

**File to Modify:** `apps/backend/src/routes/investments.ts`

---

## Audit Completion Checklist

- [x] All routes inventoried
- [x] Activity log creation paths identified
- [x] XP awarding paths identified
- [x] Energy enforcement verified
- [x] Bypass paths identified
- [ ] All bypass paths fixed
- [ ] Verification completed

