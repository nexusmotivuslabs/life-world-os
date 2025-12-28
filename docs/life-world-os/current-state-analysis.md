# Current State Analysis

Life World OS: What Exists vs What's Needed

## Overview

This document maps the current Life World OS implementation to the mechanical system defined in DIRECTOR.md, MECHANICS_BASELINE.md, and the rules engine domain model. It identifies what exists, what's missing, and what must be changed.

---

## What Exists

### Stats (Clouds)

**Current Implementation:**
- Location: `apps/backend/prisma/schema.prisma` (Cloud model)
- Stats tracked: Capacity, Engines, Oxygen, Meaning, Optionality (all 0-100)
- Storage: Database fields in `clouds` table

**Current Behavior:**
- Stats are displayed as numbers
- Stats can be manually edited (CloudStrengthEditor component)
- Stats affect XP calculations indirectly (through XP system)
- Stats do not actively modify system rules

**Status:** ❌ **Labels, not levers** - Stats exist but don't change decision-making

---

### Resources

**Current Implementation:**
- Location: `apps/backend/prisma/schema.prisma` (Resources model)
- Resources: Oxygen (months), Water (0-100), Gold (currency), Armor (0-100), Keys (count)
- Storage: Database fields in `resources` table
- API: `apps/backend/src/routes/resources.ts`

**Current Behavior:**
- Resources can be manually adjusted
- Resources are displayed
- Resources can change through actions (optional resourceChanges parameter)
- No automatic decay
- No Energy resource exists

**Status:** ⚠️ **Partial** - Resources exist but Energy is missing, no automatic decay

---

### Actions

**Current Implementation:**
- Location: `apps/backend/src/routes/xp.ts` (POST /activity endpoint)
- Action types: WORK_PROJECT, EXERCISE, SAVE_EXPENSES, LEARNING, CUSTOM
- XP calculation: `apps/backend/src/services/xpCalculator.ts`
- Frontend: `apps/frontend/src/components/QuickActions.tsx`

**Current Behavior:**
- Actions record XP gains
- Actions can optionally change resources (manual parameter)
- No energy costs
- No failure states prevent actions
- Actions always succeed if valid type

**Status:** ❌ **No costs, no tradeoffs** - Actions are free and always succeed

---

### XP System

**Current Implementation:**
- Location: `apps/backend/prisma/schema.prisma` (XP model)
- Overall XP and category XP tracked
- Rank calculation: `apps/backend/src/services/rankService.ts`
- XP calculation: `apps/backend/src/services/xpCalculator.ts`

**Current Behavior:**
- XP gains from actions
- Season multipliers apply
- Rank progression based on XP
- Category XP for each Cloud

**Status:** ✅ **Functional** - XP system works but needs Capacity modifiers

---

### Seasons

**Current Implementation:**
- Location: `apps/backend/prisma/schema.prisma` (User model, Season enum)
- Season validation: `apps/backend/src/services/seasonValidator.ts`
- Season routes: `apps/backend/src/routes/seasons.ts`
- Frontend: `apps/frontend/src/components/SeasonIndicator.tsx`

**Current Behavior:**
- Seasons affect XP multipliers
- Season transitions validated (minimum duration, Water checks)
- Season history tracked
- No time-based ticks trigger season evaluation

**Status:** ⚠️ **Partial** - Seasons exist but no automatic time progression

---

### Activity Logs

**Current Implementation:**
- Location: `apps/backend/prisma/schema.prisma` (ActivityLog model)
- Logging: `apps/backend/src/routes/xp.ts` (creates ActivityLog)
- History: Activity log includes XP, resource changes, season context

**Current Behavior:**
- Actions logged with XP gains and resource changes
- Timestamps recorded
- Can query history

**Status:** ⚠️ **Partial** - Logging exists but not event-based architecture

---

## What's Missing

### Energy Resource

**Required:**
- Daily energy budget (100 base, modified by Capacity)
- Energy costs for all actions
- Energy reset at daily tick
- Energy cannot go negative

**Status:** ❌ **Completely missing**

**Impact:** No scarcity, no tradeoffs, no prioritization

---

### Time Ticks

**Required:**
- Daily Tick (decay, Energy reset)
- Weekly Tick (imbalance, penalties)
- Seasonal Checkpoint (evaluation)
- Deterministic replay for offline periods

**Status:** ❌ **Completely missing**

**Impact:** No time pressure, no automatic decay, no consequences for inaction

---

### Decay Mechanics

**Required:**
- Oxygen daily decay (0.1 months/day if no Engines)
- Capacity weekly decay if neglected (-2/week)
- Meaning weekly decay if value drift (-1/week)
- Optionality weekly decay if stagnation (-2/week)

**Status:** ❌ **Completely missing**

**Impact:** No urgency, no maintenance required, stability is free

---

### Action Costs

**Required:**
- Work Project: 30 energy
- Exercise: 25 energy
- Learning: 20 energy
- Save Expenses: 15 energy
- Custom: 20 energy
- Actions fail if insufficient Energy

**Status:** ❌ **Completely missing**

**Impact:** Actions are free, no tradeoffs, no prioritization

---

### Stat-Driven Rules

**Required:**
- Capacity modifies Energy cap (70/85/100/110)
- Capacity modifies XP efficiency (70%/85%/100%/110%)
- Low Capacity reduces XP gains
- Low Oxygen triggers stress events
- High Optionality unlocks actions
- Stats must change system behavior

**Status:** ❌ **Not implemented**

**Impact:** Stats are labels, not levers

---

### Failure States

**Required:**
- Burnout (Capacity <30 for 14 days)
- Financial Stress (Oxygen <0.5 months)
- Stagnation (Optionality <25 for 14 days)
- Failure state effects and recovery

**Status:** ❌ **Completely missing**

**Impact:** No consequences, no failure possible

---

### Over-Optimization Penalties

**Required:**
- Excessive Work reduces Capacity (-3/week)
- Excessive Saving reduces Meaning (-2/week)
- Excessive Learning reduces Optionality (-3/week)
- Weekly evaluation and penalties

**Status:** ❌ **Completely missing**

**Impact:** Single-game optimization not punished

---

### Event-Based Architecture

**Required:**
- Event store (immutable events)
- State projection from events
- Event replay capability
- No direct state mutation

**Status:** ❌ **Completely missing**

**Impact:** No auditability, state can be directly modified, cannot replay history

---

## Migration Path

### Phase 1: Core Mechanics

1. **Add Energy Resource**
   - Add `energy` field to Resources model
   - Initialize at 100 per player
   - Add Capacity-based cap logic

2. **Add Action Costs**
   - Modify action execution to check Energy
   - Deduct Energy before action execution
   - Fail action if insufficient Energy

3. **Implement Daily Tick**
   - Create DailyTick event type
   - Add `lastTickAt` to User model
   - Implement tick calculation and replay
   - Reset Energy on tick

4. **Implement Decay**
   - Oxygen daily decay (0.1 months if no Engines)
   - Capacity weekly decay if neglected
   - Meaning weekly decay if value drift

5. **Add Capacity Modifiers**
   - Modify Energy cap based on Capacity
   - Modify XP efficiency based on Capacity
   - Update XP calculation logic

6. **Add Burnout Failure State**
   - Track consecutive low Capacity days
   - Trigger Burnout when threshold met
   - Apply Burnout penalties

7. **Add Over-Optimization Penalties**
   - Track action distribution weekly
   - Apply penalties on Weekly Tick
   - Log penalty events

8. **Lock UI Truth Source**
   - Remove manual stat editing
   - UI submits intents only
   - All state from backend projection

### Phase 2: Event Architecture

1. **Create Event Store**
   - Event model in database
   - Event types enum
   - Event replay logic

2. **State Projection**
   - Derive state from events
   - Cache projections
   - Replay capability

3. **Migrate Actions to Events**
   - Convert action execution to event emission
   - Remove direct state updates
   - State from projection only

### Phase 3: Advanced Mechanics

1. **Additional Failure States**
   - Financial Stress
   - Stagnation

2. **Recovery Mechanics**
   - Failure state recovery logic
   - Recovery time requirements

3. **Milestone System Enhancement**
   - Event-based milestone evaluation
   - Milestone unlocks

---

## Breaking Changes Required

### Database Schema Changes

**Resources Model:**
- Add `energy` field (Int, 0-110, default 100)

**User Model:**
- Add `lastTickAt` field (DateTime)
- Add `lastWeeklyTickAt` field (DateTime, optional)

**New Models Needed:**
- Event model (event store)
- FailureState model (active failure states)

### API Changes

**Action Execution:**
- Energy check before action
- Energy deduction
- Action failure if insufficient Energy

**Resource Updates:**
- Remove manual resource editing (admin only)
- Resources updated through actions only

**New Endpoints:**
- Tick application endpoint
- Event replay endpoint
- Failure state query endpoint

### Frontend Changes

**Remove:**
- CloudStrengthEditor (manual stat editing)
- Manual resource editing (keep admin only)

**Add:**
- Energy display
- Energy costs shown on actions
- Failure state indicators
- Decay warnings

**Modify:**
- Action buttons check Energy before enabling
- All stats/resources from backend only
- No client-side state manipulation

---

## Code References

### Current Implementation Locations

**Stats (Clouds):**
- Schema: `apps/backend/prisma/schema.prisma` (lines 121-133)
- API: `apps/backend/src/routes/clouds.ts`
- Frontend: `apps/frontend/src/components/CloudGauge.tsx`, `CloudStrengthEditor.tsx`

**Resources:**
- Schema: `apps/backend/prisma/schema.prisma` (lines 135-147)
- API: `apps/backend/src/routes/resources.ts`
- Frontend: `apps/frontend/src/components/ResourceCard.tsx`, `ResourceTransaction.tsx`

**Actions:**
- API: `apps/backend/src/routes/xp.ts` (POST /activity, lines 96-219)
- Service: `apps/backend/src/services/xpCalculator.ts`
- Frontend: `apps/frontend/src/components/QuickActions.tsx`

**XP System:**
- Schema: `apps/backend/prisma/schema.prisma` (lines 149-164)
- Service: `apps/backend/src/services/xpCalculator.ts`
- Service: `apps/backend/src/services/rankService.ts`

**Seasons:**
- Schema: `apps/backend/prisma/schema.prisma` (Season enum, User model)
- Service: `apps/backend/src/services/seasonValidator.ts`
- API: `apps/backend/src/routes/seasons.ts`

**Activity Logs:**
- Schema: `apps/backend/prisma/schema.prisma` (lines 221-239)
- Created in: `apps/backend/src/routes/xp.ts` (line 189)

---

## Summary

### Current State: Descriptive Dashboard

- Stats displayed but don't affect rules
- Actions are free
- No time pressure
- No decay
- No failure states
- Resources can be manually edited
- State can be directly modified

### Target State: Mechanical System

- Stats modify rules (levers, not labels)
- Actions have costs and tradeoffs
- Time creates pressure
- Decay requires maintenance
- Failure is possible
- Resources managed through actions
- State derived from events

### Gap Analysis

**Critical Missing:**
- Energy resource and costs
- Time ticks
- Decay mechanics
- Stat-driven rules
- Failure states
- Event architecture

**Needs Modification:**
- Action execution (add costs)
- Stat behavior (make them levers)
- Resource management (remove manual editing)
- State management (event-based)

**Can Keep:**
- XP system (add Capacity modifiers)
- Seasons (add time-based evaluation)
- Activity logs (convert to events)
- Database structure (add missing fields)

---

## Next Steps

See PHASE_1_EXECUTION.md for detailed implementation steps.

Start with Energy resource and action costs - these are the foundation of all other mechanics.


