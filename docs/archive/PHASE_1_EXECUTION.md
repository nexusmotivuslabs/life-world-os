# PHASE_1_EXECUTION.md

Life World OS
Phase 1: Make the World Real

## Phase objective

Convert Life World OS from a **descriptive dashboard** into a **mechanical system** with:

* Scarcity
* Time pressure
* Decay
* Meaningful tradeoffs
* Recoverable failure

Phase 1 ends when the system can meaningfully punish bad decisions and reward good ones over time.

No new features. No polish. No expansion.

---

## Phase 1 success criteria (non negotiable)

Phase 1 is complete only when all are true:

* Energy exists and constrains actions
* At least one stat decays daily
* Time ticks apply deterministically
* Over optimisation creates penalties
* Burnout failure state can be triggered
* UI reflects engine truth only

If any of these are false, Phase 1 is incomplete.

---

## Allowed scope

Agents may:

* Add backend rules engine logic
* Introduce events and projections
* Modify action execution pipeline
* Disable or restrict existing actions
* Add missing resource tracking
* Add automated tick execution

Agents may NOT:

* Add new stats
* Add new currencies
* Add new UI concepts
* Add new gameplay loops
* Bypass decay or energy
* Implement "quality of life" shortcuts

---

## Execution order (do not reorder)

### Step 1: Introduce Energy as a first class resource

**Actions:**

* Add Energy resource to GameState
* Initialize daily Energy = 100
* Reset Energy on Daily Tick
* Apply Capacity-based usable energy caps

**Validation:**

* No action executes if Energy < cost
* UI shows remaining Energy
* Energy cannot be negative

---

### Step 2: Enforce action costs universally

**Actions:**

* Attach energy costs to all existing actions:
  * Work Project: 30
  * Exercise: 25
  * Learning: 20
  * Save Money: 15
  * Custom: 20
* Remove any action execution path without cost enforcement

**Validation:**

* Every action emits ResourceAdjusted (Energy)
* Attempts beyond Energy cap fail deterministically
* No "free" actions remain

---

### Step 3: Implement deterministic Daily Tick

**Actions:**

* Add DailyTick event
* Track lastTickAt per player
* On app load or action:
  * Calculate missing days
  * Replay ticks sequentially
* Apply decay rules during tick

**Validation:**

* Skipping days applies decay
* Refreshing UI does not apply extra ticks
* Replays are idempotent

---

### Step 4: Activate decay mechanics

**Actions:**

* Implement Oxygen daily decay
* Implement Capacity decay under neglect
* Implement Meaning decay under neglect

**Validation:**

* Stats change without user action
* Decay is visible in state history
* Decay produces events

---

### Step 5: Apply Capacity modifiers to outcomes

**Actions:**

* Modify XP gain based on Capacity bands
* Modify Energy usability based on Capacity

**Validation:**

* Low Capacity visibly reduces progress
* High Capacity slightly improves recovery
* No stat operates in isolation

---

### Step 6: Introduce Burnout failure state

**Actions:**

* Track consecutive low Capacity days
* Trigger Burnout when threshold met
* Apply Burnout penalties

**Validation:**

* Burnout restricts play
* Recovery requires time and actions
* Burnout cannot be instantly cleared

---

### Step 7: Enforce over optimisation penalties

**Actions:**

* Track action distribution weekly
* Apply penalties on Weekly Tick:
  * Excessive Work
  * Excessive Saving
  * Excessive Learning

**Validation:**

* Penalties apply even if player is "winning"
* Penalties are visible and logged
* Penalties do not instantly reverse

---

### Step 8: Lock UI truth source

**Actions:**

* Remove any UI logic that modifies stats directly
* UI must submit intents only
* All numbers displayed must come from projected state

**Validation:**

* Frontend cannot cheat
* Backend rejects invalid state transitions
* Event replay reproduces UI exactly

---

## Phase 1 forbidden fixes

Agents must not:

* Add notifications to "soften" decay
* Increase rewards to offset penalties
* Hide failure states
* Add manual overrides
* Add tutorial popups explaining mechanics

Friction is intentional.

---

## Phase 1 completion checklist

All must pass:

* [ ] Can Energy hit zero?
* [ ] Can Oxygen decay without action?
* [ ] Can Burnout occur naturally?
* [ ] Does doing nothing hurt?
* [ ] Do stats change rules, not just numbers?
* [ ] Can the same event stream replay cleanly?

If any answer is no, Phase 1 is not done.

---

## What Phase 1 intentionally ignores

* Advanced milestones
* Seasonal strategy depth
* Long term investments
* Portfolio mechanics
* Social or narrative layers
* Optimisation polish

Those come later.

---

## Director's instruction

Do not expand the system yet.

Make it honest first.

Only once decisions hurt should decisions matter.

