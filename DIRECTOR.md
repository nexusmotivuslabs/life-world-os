# DIRECTOR.md

Life World OS
System Director and Design Authority

## Purpose of this document

This document defines the non-negotiable rules, mechanics, and design intent of Life World OS.

It exists to:

- Prevent the system from degrading into a passive dashboard
- Ensure stats function as levers, not labels
- Guide agents, contributors, and future refactors
- Preserve the game-like tension that mirrors real life

If there is a conflict between UI, features, or convenience and this document, this document wins.

---

## Core design philosophy

Life World OS is not a habit tracker.
It is a personal systems simulator.

The system models:

- Scarcity
- Tradeoffs
- Time pressure
- Decay
- Recovery
- Compounding decisions

If a feature does not reinforce these realities, it does not belong.

---

## Fundamental system truths

These truths must be encoded in mechanics, not copy.

1. Energy is limited
2. Time always moves forward
3. Inaction has a cost
4. Over-optimisation creates imbalance
5. Recovery takes time
6. Optionality is fragile
7. Stability must be maintained, not assumed

---

## Stats are levers, not labels

Stats must actively change how the system behaves.

If a stat only displays a number and does not influence rules, it must be removed or refactored.

### Core stats and their intent

**Capacity**
- Governs energy regeneration, XP efficiency, and resilience to pressure
- Low Capacity reduces XP gained from all actions
- Low Capacity caps usable energy below daily maximum
- High Capacity provides bonus usable energy and faster recovery

**Engines**
- Governs income flow, gold generation, and long-term compounding
- High Engines unlocks higher-value actions
- Engines generate Gold/Oxygen through active Engines

**Oxygen**
- Governs stability, stress tolerance, and survival buffer
- Low Oxygen introduces penalties or stress events
- Oxygen decays daily without maintenance
- High Oxygen enables major bets and risk-taking

**Meaning**
- Governs motivation, burnout resistance, and decay protection
- High Meaning increases resilience to decay or setbacks
- Low Meaning accelerates decay rates
- Meaning decays when actions drift from values

**Optionality**
- Governs available choices, risk tolerance, and strategic freedom
- High Optionality unlocks higher-risk, higher-reward actions
- Low Optionality restricts available actions
- Optionality decays when resources are idle or misused

Each stat must introduce at least one rule change in the system.

---

## Minimal viable mechanics (non-negotiable)

These mechanics must exist before adding new features.

### 1. Daily energy budget

- Each day begins with a fixed energy pool (100 base)
- All actions consume energy
- Energy regenerates slowly and unevenly (via daily tick)
- Overuse leads to penalties
- Capacity modifies usable energy cap

Without an energy budget, decisions are meaningless.

### 2. Action tradeoffs

Every action must answer: **If I do this, what am I not doing?**

Each action must have:

- A cost (energy, time, resources)
- A benefit (XP, resources, stat changes)
- A second-order effect (imbalance, decay, or opportunity cost)

Actions without tradeoffs must be removed.

### 3. Time as an active force

Time is not cosmetic.

The system must include:

- Daily ticks
- Weekly decay
- Seasonal checkpoints

Examples:

- Resources decay over time
- Neglected stats degrade
- Long-term investments mature across seasons
- Ignoring a stat compounds future penalties

Time creates pressure. Pressure creates meaning.

### 4. Decay and pressure

Nothing stays stable without effort.

At minimum:

- Oxygen decays daily
- Capacity decays when neglected
- Meaning decays when actions drift from values
- Optionality decays when resources stagnate

Decay ensures urgency and engagement.

### 5. Over-optimisation penalties

The system must punish one-dimensional optimisation.

Examples:

- Excessive work reduces Capacity
- Excessive saving reduces Meaning
- Excessive learning without execution reduces Optionality

Balance is not aesthetic. It is mechanical.

### 6. Failure states and recovery

Failure must be possible.

Valid failure states include:

- Burnout (Capacity too low for too long)
- Financial stress (Oxygen too low)
- Stagnation (Optionality decay)
- Loss of optionality (resources depleted)

Recovery must:

- Take time
- Require sacrifice
- Reduce short-term gains

Instant recovery invalidates the system.

---

## System questions the app must force

If the app does not regularly force these questions, it is failing.

1. If I exercise, what am I not doing?
2. Do I have the energy to do this today?
3. What decays if I ignore it?
4. What happens if I over-optimise this stat?
5. Am I trading short-term comfort for long-term optionality?
6. What breaks if I do nothing this season?

---

## Role of agents

Agents are not feature builders.
Agents are mechanics enforcers.

Agents must:

- Identify stats that do not affect rules
- Attach mechanical consequences to each stat
- Add costs to all actions
- Introduce decay where stability is assumed
- Remove features that eliminate tension

Agents should default to removing features, not adding them.

---

## Guardrails for future development

1. No feature without a cost
2. No stat without a rule change
3. No progression without decay
4. No season without consequence
5. No optimisation without tradeoff

If the system ever feels "easy", something is broken.

---

## Director's final note

Life World OS should feel:

- Slightly uncomfortable
- Honest
- Grounded
- Empowering through clarity, not motivation

The goal is not to make the user feel good today.
The goal is to help them make better decisions over time.

That is the game.


