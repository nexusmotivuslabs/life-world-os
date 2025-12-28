# CURSOR.md

Life World OS
Agent Enforcement Contract

## Purpose

This file defines how coding agents must operate when modifying Life World OS.

Agents are not feature builders first.
Agents are mechanics enforcers first.

If a change makes the system feel easier, flatter, or more like a passive dashboard, the change is wrong.

This contract is binding for all agent work.

---

## Non negotiable invariants

### 1. Stats must be levers, not labels

A stat must change system behavior through rules.
If a stat does not affect outcomes, costs, availability, penalties, or progression, it must be removed or refactored.

### 2. Every action has costs and tradeoffs

Every player action must have:

* Energy cost
* Time cost or time consumption via tick alignment
* At least one secondary effect or opportunity cost

Actions without tradeoffs are not allowed.

### 3. Time must matter

Time is an active force.
Agents must preserve:

* Daily tick
* Weekly decay
* Seasonal checkpoints

If time becomes cosmetic, the system is broken.

### 4. Decay and pressure must exist

At minimum:

* Oxygen decays daily
* At least one of Capacity or Meaning decays under neglect
* Optionality can decay when resources stagnate

If stability is free, the system is invalid.

### 5. Over optimisation must create imbalance

The system must punish one dimensional play.
If an agent adds a new reward loop, it must add a balancing cost or penalty.

### 6. Failure states must be possible and recoverable

Agents must not remove failure states.
Recovery must take time and require sacrifice.
Instant fixes are not allowed.

---

## Agent operating procedure

### Step 0: Reference Dev Hub

**Before starting any work, agents MUST reference the Dev Hub:**

The Dev Hub is now a separate deployable application. Access it at:
- **Production**: `https://dev-hub.yourdomain.com` (update with your actual URL)
- **Local Development**: `http://localhost:3001` (when running `npm run dev:dev-hub`)

Review relevant sections:
- **00. Principles** - Ownership & Responsibility, Safety Over Speed, Promotion Not Deployment
- **10. Developer Contracts** - Local Testing, CI Responsibility, Staging Promotion
- **20. Workflows** - Branching Strategy, Release Flow, Hotfix Process
- **30. Tooling** - Local Setup, Test Commands, CI Overview
- **40. Reference** - Architecture, ADRs, Runbooks

The Dev Hub is the source of truth for all development practices. Agents must align their work with these guidelines.

**Note**: The Dev Hub app is located at `apps/dev-hub-app/` and can be deployed independently.

### Step A: Identify boundaries

For any change, agents must explicitly state:

* Responsibility
* Boundary
* Invariants touched
* Failure modes introduced or mitigated

If an agent cannot name these, it must stop and request guidance.

### Step B: Check mechanics first, UI second

Agents must implement or validate rules engine behavior before UI changes.
UI may only reflect state that the rules engine has produced.

Frontend should never invent game truth.

### Step C: Preserve auditability

All state transitions must be recorded as events.
If an agent introduces a new mechanic, it must introduce a corresponding event type.

No invisible mutations.

### Step D: Prefer removal over addition

If the system feels cluttered or confusing, agents should remove features that do not reinforce tension.

---

## Required artifacts for every change

Agents must deliver these with each PR or change set.

1. **Mechanical impact note**

* What lever changed
* What costs changed
* What time pressure changed
* What tradeoff was introduced

2. **Domain model impact**

* Which entities changed
* Which invariants were added or modified

3. **Test checklist**

* At least one happy path
* At least one failure state
* At least one decay tick validation
* At least one imbalance scenario

---

## Golden questions agents must enforce

The system must force these regularly.

* If I do this, what am I not doing?
* Do I have the energy to do this today?
* What decays if I ignore it?
* What happens if I over optimise this stat?
* What breaks if I do nothing this season?

If agents cannot point to mechanics that answer these, they must not ship.

---

## Anti patterns (block immediately)

Agents must refuse and propose alternatives when requested to:

* Add rewards without costs
* Add stats that do not control rules
* Add features that bypass time or decay
* Add shortcuts that remove tension
* Move logic into UI that should be in the rules engine
* Hard code progression without referencing events and rules

---

## Definition of done for mechanics

A mechanic is done only when:

* It has a rule definition
* It has cost and benefit
* It interacts with time
* It has at least one failure or penalty scenario
* It produces an event trail

---

## Escalation policy

If a request conflicts with DIRECTOR.md or these invariants, agents must:

1. Explain the conflict briefly
2. Offer the smallest compliant alternative
3. Stop if the user insists on violating invariants

This is how the game stays real.

