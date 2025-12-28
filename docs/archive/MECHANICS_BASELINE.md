# MECHANICS_BASELINE.md

Life World OS
Canonical Mechanics and World Physics

## Purpose

This document defines the **fixed mechanical baseline** of Life World OS.

It establishes:

* Numeric anchors
* Default costs
* Decay rates
* Thresholds
* Non negotiable constraints

Agents must treat this file as **ground truth** for balancing and execution.

If a mechanic is not defined here, agents must not invent values.

---

## Core design stance

* Mechanics favor realism over motivation
* Scarcity is intentional
* Recovery is slower than depletion
* Stability is maintained, not free
* Progress compounds slowly

This baseline is designed to feel slightly tight.

---

## Time model

### Canonical tick cadence

* **Daily Tick**
  * Runs once per calendar day per player
  * Applies decay and regeneration
  * Resets daily Energy pool

* **Weekly Tick**
  * Runs every 7 daily ticks
  * Evaluates imbalance and failure accumulation
  * Applies over-optimization penalties

* **Seasonal Checkpoint**
  * Runs at season end
  * Evaluates milestones and season outcomes
  * Triggers season transition logic

### Offline behavior

* Missed ticks are replayed deterministically
* No tick may be skipped silently
* Decay applies retroactively

---

## Energy system

### Daily energy budget

* Base daily energy: **100**
* Energy does not stack across days
* Unused energy is lost at next daily tick

### Energy regeneration

* Energy fully resets at daily tick
* Capacity modifies *effective usable energy*

Capacity modifier:

* Capacity < 30: usable energy capped at **70**
* Capacity 30–60: usable energy capped at **85**
* Capacity 60–80: usable energy capped at **100**
* Capacity > 80: usable energy capped at **110** (soft bonus)

### Energy costs (base)

* Work Project: **30 energy**
* Exercise: **25 energy**
* Learning: **20 energy**
* Save Expenses: **15 energy** (passive action, lower cost)
* Custom: **20 energy** (default, may be customized)

---

## Stat model

All stats are normalized to **0–100**.

### Canonical stats (locked)

* Capacity
* Engines
* Oxygen (Cloud strength, not the resource)
* Meaning
* Optionality

### Stat thresholds

**Low (0–30):**
* Introduces penalties
* Restricts actions
* Accelerates decay

**Medium (31–60):**
* Standard operation
* No modifiers

**High (61–80):**
* Positive modifiers apply
* Unlocks actions

**Very High (81–100):**
* Maximum bonuses
* Best outcomes

---

## Action costs and rewards

### Work Project

* **Energy cost:** 30
* **XP reward:** 500 overall, +300 engines, +100 capacity, +50 oxygen
* **Resource changes:** Optional (may generate Gold)
* **Second-order effect:** Reduces Capacity if done excessively

### Exercise

* **Energy cost:** 25
* **XP reward:** 200 overall, +250 capacity, +50 optionality
* **Resource changes:** May increase Water
* **Second-order effect:** Increases Capacity over time

### Learning

* **Energy cost:** 20
* **XP reward:** 400 overall, +200 optionality, +150 capacity, +100 engines
* **Resource changes:** None (direct)
* **Second-order effect:** Reduces Optionality if not applied (learning without execution)

### Save Expenses

* **Energy cost:** 15
* **XP reward:** 1000 overall, +500 oxygen, +300 optionality, +200 engines
* **Resource changes:** Increases Oxygen resource, may increase Gold
* **Second-order effect:** Reduces Meaning if done excessively (hoarding)

---

## Decay rates

### Oxygen (Resource)

* **Daily decay:** 0.1 months (if no active Engines)
* **Decay reduction:** Active Engines offset decay (1 Engine = 0.05 months offset)
* **Minimum:** Cannot go below 0

### Capacity (Stat)

* **Weekly decay (if neglected):** -2 points per week
* **Neglect definition:** No capacity-improving actions for 7 days
* **Decay stops:** When Capacity hits 20 (floor)

### Meaning (Stat)

* **Weekly decay (if value drift):** -1 point per week
* **Value drift definition:** Actions consistently misaligned with user's stated values
* **Decay stops:** When Meaning hits 20 (floor)

### Optionality (Stat)

* **Weekly decay (if stagnation):** -2 points per week
* **Stagnation definition:** Resources idle and no action diversity for 7 days
* **Decay stops:** When Optionality hits 20 (floor)

---

## Failure state thresholds

### Burnout

* **Trigger:** Capacity < 30 for 14 consecutive days
* **Effects:**
  * Energy cap reduced to 50
  * XP gain reduced by 50%
  * Cannot perform Work Project actions
* **Recovery:** Requires 7 consecutive days with Capacity > 50 and no Work actions

### Financial Stress

* **Trigger:** Oxygen resource < 0.5 months
* **Effects:**
  * Stress events (random penalties)
  * Cannot make major bets
  * Reduces Meaning by 1 point per week
* **Recovery:** Oxygen resource > 1 month for 7 consecutive days

### Stagnation

* **Trigger:** Optionality < 25 for 14 consecutive days
* **Effects:**
  * Action variety restricted
  * Decay rates double
  * No XP bonus multipliers
* **Recovery:** Optionality > 40 for 7 consecutive days with diverse actions

---

## Over-optimization penalties

Applied on Weekly Tick if distribution is imbalanced.

### Excessive Work

* **Definition:** Work actions > 60% of total actions in past week
* **Penalty:** Capacity reduces by -3 points
* **Message:** "Overwork detected. Capacity decreasing."

### Excessive Saving

* **Definition:** Save actions > 40% of total actions in past week
* **Penalty:** Meaning reduces by -2 points
* **Message:** "Hoarding detected. Meaning decreasing."

### Excessive Learning Without Execution

* **Definition:** Learning actions > 50% of total, no Work/Exercise actions
* **Penalty:** Optionality reduces by -3 points
* **Message:** "Learning without application. Optionality decreasing."

---

## Season multipliers

* **Spring:** 1.2x Learning/Planning activities
* **Summer:** 1.3x Work/Revenue activities
* **Autumn:** 1.2x Optimization/Teaching activities
* **Winter:** 1.1x Rest/Reflection activities

Multipliers apply to XP gains only, not costs.

---

## Capacity modifier table

| Capacity Range | Usable Energy Cap | XP Efficiency | Recovery Rate |
|---------------|-------------------|---------------|---------------|
| 0-29          | 70                | 70%           | 50%           |
| 30-59         | 85                | 85%           | 75%           |
| 60-79         | 100               | 100%          | 100%          |
| 80-100        | 110               | 110%          | 125%          |

---

## Validation rules

All values in this document are **canonical**.
If implementation differs, implementation is wrong.

Changes to this document require:
1. Explicit approval
2. Full impact analysis
3. Migration plan for existing players

