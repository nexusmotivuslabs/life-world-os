# XP System Documentation

## Overview

The Life World OS uses a hybrid XP system combining Halo 3-style overall progression with Destiny 2-style category specialization.

## Overall XP System (Halo 3 Style)

### Rank Progression

| Rank | Min XP | Max XP |
|------|--------|--------|
| Recruit | 0 | 1,000 |
| Private | 1,000 | 5,000 |
| Corporal | 5,000 | 10,000 |
| Sergeant | 10,000 | 20,000 |
| Staff Sergeant | 20,000 | 35,000 |
| Sergeant First Class | 35,000 | 55,000 |
| Master Sergeant | 55,000 | 80,000 |
| First Sergeant | 80,000 | 110,000 |
| Sergeant Major | 110,000 | 150,000 |
| Command Sergeant Major | 150,000+ | ∞ |

### Level Calculation

```
Level = floor(Overall XP / 5000) + 1
```

## Category XP System (Destiny 2 Style)

### Categories

1. **Capacity XP** - Health, energy, resilience activities
2. **Engines XP** - Income generation, career, business activities
3. **Oxygen XP** - Financial stability, savings, cash flow activities
4. **Meaning XP** - Values, purpose, philosophy, alignment activities
5. **Optionality XP** - Freedom, assets, skills, choices activities

### Category Level Calculation

```
Category Level = floor(Category XP / 1000) + 1
```

Each level represents 1,000 category XP.

## XP Earning Formulas

### Base XP Values

| Activity | Overall XP | Capacity | Engines | Oxygen | Meaning | Optionality |
|----------|-----------|----------|---------|--------|---------|-------------|
| Work Project | 500 | 100 | 300 | 50 | 0 | 0 |
| Exercise | 200 | 250 | 0 | 0 | 0 | 50 |
| Save Expenses | 1000 | 0 | 200 | 500 | 0 | 300 |
| Learning | 400 | 150 | 100 | 0 | 0 | 200 |
| Season Completion | 1000 | 200 | 200 | 200 | 200 | 200 |
| Milestone | 2000 | 500 | 500 | 500 | 500 | 500 |

### Season Multipliers

| Season | Multiplier | Focus Areas |
|--------|-----------|-------------|
| Spring | 1.2x | Learning/Planning activities |
| Summer | 1.3x | Work/Revenue activities |
| Autumn | 1.2x | Optimization/Teaching activities |
| Winter | 1.1x | Rest/Reflection activities |

### Final XP Calculation

```
Final Overall XP = Base Overall XP × Season Multiplier
Final Category XP = Base Category XP × Season Multiplier
```

## Balance Indicator

### Imbalance Detection

System warns if any category is >10 levels below average:

```
Average Level = (Capacity + Engines + Oxygen + Meaning + Optionality) / 5
Imbalance = Any category level < (Average Level - 10)
```

### Balance Rewards

Balanced progression (all categories within 5 levels of average) may receive bonus Overall XP in future updates.

## Milestone XP Bonuses

Major milestones award large XP bonuses:

- 6 months expenses: +5,000 Overall XP, +1,000 each category
- 1 year expenses: +10,000 Overall XP, +2,000 each category
- First asset: +3,000 Overall XP, +500 each category
- Reduced fragility: +2,000 Overall XP, +400 each category

## Custom XP

Users can record custom activities with custom XP values for flexibility.


