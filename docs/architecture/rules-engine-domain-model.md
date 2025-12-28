# Rules Engine Domain Model

Life World OS

## Goal

Define a domain model that turns Life World OS from a dashboard into a living system.

The rules engine must be the single source of truth for:

- State
- Transitions
- Time ticks
- Costs, tradeoffs, penalties
- Progression

UI only renders state and submits intents.

---

## Core concepts

### Player

Represents the person using the system.

**Key fields:**

- `playerId` (string, unique)
- `currentSeasonId` (string)
- `timezone` (string)
- `createdAt` (datetime)

**Invariants:**

- A player has exactly one active season at a time.
- All state changes are derived from events.

---

### Season

A time bounded chapter with goals and checkpoints.

**Key fields:**

- `seasonId` (string, unique)
- `name` (string)
- `theme` (Season enum: SPRING, SUMMER, AUTUMN, WINTER)
- `startDate` (datetime)
- `endDate` (datetime, optional) or `durationDays` (number)
- `dayIndex` (number, derived)

**Invariants:**

- Season time moves forward only.
- Seasonal checkpoints must evaluate against accumulated state and events.

---

### Stat

A lever that modifies system behavior.

Examples: Capacity, Engines, Oxygen, Meaning, Optionality

**Key fields:**

- `statType` (enum: CAPACITY, ENGINES, OXYGEN, MEANING, OPTIONALITY)
- `currentValue` (number, 0 to 100)
- `bands` or `tiers` (for rule thresholds)

**Invariants:**

- Each stat must be referenced by at least one active rule.
- Stat updates happen only through events.

---

### Resource

A trackable quantity used for costs, buffers, and progression.

Examples: Energy, Gold, Water, Armor, Keys, OxygenMonths

**Key fields:**

- `resourceType` (enum: ENERGY, GOLD, WATER, ARMOR, KEYS, OXYGEN_MONTHS)
- `currentAmount` (number)
- `minAmount` (number, often 0)
- `maxAmount` (number, optional)

**Invariants:**

- Resources cannot go below minAmount.
- If a cost would violate minAmount, the action must fail or trigger a failure state.

---

### Action

A player intent that can be executed if rules allow.

Examples: Exercise, Work Project, Learning, Save Money, Custom

**Key fields:**

- `actionType` (enum: WORK_PROJECT, EXERCISE, LEARNING, SAVE_EXPENSES, CUSTOM)
- `baseCosts` (ResourceCost map)
- `baseRewards` (Reward map)
- `tags` (array: health, finance, skill, relationship)

**Invariants:**

- Every action has at least one cost.
- Every action has an opportunity cost enforced via energy and time.

---

### Policy and Rule

Declarative mechanics that determine outcomes.

**Policy** is a named group of rules.
**Rule** is a single condition and effect.

**Types of rules:**

1. **Eligibility rules:** can this action run now
2. **Cost rules:** modify costs based on stats or context
3. **Reward rules:** modify rewards based on stats or streaks
4. **Decay rules:** apply on time ticks
5. **Imbalance rules:** penalties for over optimisation
6. **Failure rules:** trigger failure states when thresholds hit
7. **Recovery rules:** govern recovery pathways

**Invariants:**

- Rules must be deterministic given the same inputs.
- Rules must be versioned so history can be replayed.

---

### GameState

A snapshot derived from events.

**Key fields:**

- `stats` (map: StatType → number)
- `resources` (map: ResourceType → number)
- `activeFailureStates` (array: FailureState)
- `streaks` (map: string → number)
- `milestonesAchieved` (array: MilestoneType)
- `lastTickAt` (datetime)

**Invariants:**

- GameState is derived, not directly written.
- Two replays of the same event stream must produce the same GameState.

---

### Event

The immutable record of what happened.

Examples:

- `ActionRecorded`
- `ResourceAdjusted`
- `StatAdjusted`
- `TickApplied`
- `DecayApplied`
- `FailureTriggered`
- `RecoveryStarted`
- `RecoveryCompleted`
- `MilestoneAchieved`
- `SeasonCheckpointEvaluated`

**Key fields:**

- `eventId` (string, unique)
- `playerId` (string)
- `timestamp` (datetime)
- `eventType` (enum)
- `payload` (JSON)
- `ruleVersion` (string)
- `correlationId` (string, optional)

**Invariants:**

- Events are append only.
- Events must be sufficient to rebuild all state.

---

### Tick

A time progression unit that applies decay and scheduled evaluations.

**Types:**

- `DailyTick`
- `WeeklyTick`
- `SeasonalCheckpoint`

**Invariants:**

- Ticks cannot be skipped silently.
- If the app was offline, multiple ticks may be applied in sequence deterministically.

---

### FailureState

A named state that constrains play and changes rewards.

Examples: Burnout, FinancialStress, Stagnation, LowOptionality

**Key fields:**

- `failureType` (enum: BURNOUT, FINANCIAL_STRESS, STAGNATION, LOW_OPTIONALITY)
- `severity` (number, 1-10)
- `triggeredAt` (datetime)
- `exitCriteria` (Rule reference)

**Invariants:**

- Failure states must introduce penalties or restrictions.
- Recovery requires time and tradeoffs.

---

### Milestone

A threshold based achievement that unlocks meaning or optionality, not just vanity badges.

Examples: 3 Months Expenses Covered, First Income Producing Asset, Ability to Say No

**Key fields:**

- `milestoneType` (enum)
- `criteria` (Rule reference)
- `rewardEffects` (unlock, bonus, new action)

**Invariants:**

- Milestones must be computed from state and events, not manually toggled.
- Milestones should not bypass decay and pressure.

---

## Key interactions

### 1. Record action flow

1. UI submits `ActionIntent` with `actionType` and optional description.
2. Rules engine loads current `GameState` via event replay or cached snapshot.
3. Eligibility rules validate.
4. Cost rules compute final costs.
5. Apply costs, then rewards.
6. Emit events for costs, rewards, and action recorded.
7. Recompute state and return updated state.

### 2. Apply tick flow

1. Determine missing ticks since `lastTickAt`.
2. For each tick:
   - Apply decay rules
   - Evaluate imbalance rules
   - Evaluate failure triggers
   - Evaluate milestone criteria
   - Emit `TickApplied` and derived events
3. Persist events and return updated state.

---

## Minimal viable mechanics mapping

This is the smallest set that must exist.

### Daily energy budget

- Resource: Energy
- Rule: Energy regen depends on Capacity
- Action cost: all actions consume Energy

### Time matters

- Tick: DailyTick
- Rule: decay applies on ticks

### Decay and pressure

- Rule: Oxygen decays daily
- Rule: Capacity or Meaning decays under neglect

### Tradeoffs

- Rule: energy and time scarcity creates opportunity cost
- Rule: at least one action competes directly with another (shared resource constraint)

### Over optimisation imbalance

- Rule: repeated Work reduces Capacity
- Rule: repeated Saving reduces Meaning
- Rule: repeated Learning without Execution reduces Optionality

### Failure and recovery

- FailureState: Burnout when Capacity too low for too long
- Recovery: requires rest actions over multiple ticks

---

## Suggested first implementation order

1. Event types and event store contract
2. State projection and snapshotting
3. Action execution pipeline with eligibility, costs, rewards
4. Daily tick with decay
5. Failure states
6. Milestones and seasonal checkpoints
7. Imbalance rules and recovery pathways

---

## Validation checklist

A rules engine is valid only if:

- [ ] The same event stream always reproduces the same state
- [ ] UI cannot change state without emitting events
- [ ] Every stat affects at least one rule
- [ ] Every action has costs and tradeoffs
- [ ] Decay occurs via ticks
- [ ] Failure is possible and recovery is time bound


