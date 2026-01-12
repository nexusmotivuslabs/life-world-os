# ENERGY

Life World OS Game Manual

## Overview

Energy is the daily budget that enables all actions. It is the primary scarcity mechanism that forces prioritization and tradeoffs. Energy resets each day, modified by Capacity, and cannot be hoarded across days.

---

## What Energy Can Do

### Enable All Actions

- Every action requires Energy
- No action is free
- Energy is the universal cost

### Daily Renewal

- Energy resets at daily tick
- Fresh allocation each day
- Cannot accumulate past daily limit

### Capacity-Modified

- Capacity stat modifies usable Energy cap
- High Capacity provides bonus Energy
- Low Capacity restricts Energy severely

---

## What Energy Cannot Do

### Stack Across Days

- Unused Energy is lost at daily tick
- Cannot save Energy for tomorrow
- Must use it or lose it

### Be Instantly Restored Mid-Day

- Energy only resets at daily tick
- No mid-day regeneration
- Must wait for next day

---

## Attributes

### Sources

1. **Daily Tick**
   - Energy fully resets at daily tick
   - Base allocation: 100
   - Automatic regeneration

2. **Capacity Modifiers**
   - Capacity stat modifies usable cap
   - Low Capacity (<30): cap at 70
   - Medium Capacity (30-60): cap at 85
   - High Capacity (60-80): cap at 100
   - Very High Capacity (80+): cap at 110

### Methods to Gain

- Daily tick reset (primary method)
- Capacity improvements (increase usable cap)
- Cannot be gained mid-day

### Methods to Lose

- All actions consume Energy
- Work Project: 30 energy
- Exercise: 25 energy
- Learning: 20 energy
- Save Expenses: 15 energy
- Custom: 20 energy (default)

### Daily Budget

- Base: 100 energy per day
- Modified by Capacity
- Resets at daily tick
- Cannot exceed usable cap

---

## Rule Interactions

### With All Actions

- Every action requires Energy
- No action is free
- Energy is universal constraint
- Actions fail if insufficient Energy

### With Capacity Stat

- Capacity modifies usable Energy cap
- Low Capacity = less Energy
- High Capacity = bonus Energy
- Primary lever of Energy Game

### With Burnout Failure State

- Burnout reduces Energy cap to 50
- Severe restriction on actions
- Recovery requires Capacity restoration
- Energy Game failure state

### With Daily Tick

- Energy resets at daily tick
- Unused Energy lost
- Fresh allocation each day
- Time-based regeneration

---

## Strategic Notes

### Optimal Use

- Prioritize high-value actions
- Balance action types
- Don't waste Energy on low-value actions
- Plan daily Energy allocation

### Pitfalls

- Running out of Energy early
- Wasting Energy on low-value actions
- Ignoring Capacity (reduces Energy)
- Overextending (leads to Burnout)

### Tradeoffs

- Every action costs Energy
- Must choose what to do and what not to do
- High-value actions cost more Energy
- Balance required across action types

---

## Energy Costs

### Base Costs

- **Work Project:** 30 energy
- **Exercise:** 25 energy
- **Learning:** 20 energy
- **Save Expenses:** 15 energy
- **Custom:** 20 energy (default)

### Capacity-Modified Cap

| Capacity Range | Usable Energy Cap |
|---------------|-------------------|
| 0-29          | 70                |
| 30-59         | 85                |
| 60-79         | 100               |
| 80-100        | 110               |

### Daily Allocation Examples

**Low Capacity (50):**
- Usable cap: 85
- Can do: ~2-3 actions per day
- Must prioritize carefully

**High Capacity (75):**
- Usable cap: 100
- Can do: ~3-4 actions per day
- Standard allocation

**Very High Capacity (85):**
- Usable cap: 110
- Can do: ~3-4 actions per day (bonus)
- Slight advantage

---

## Energy Management

### Daily Planning

- Check available Energy
- Prioritize high-value actions
- Balance action types
- Don't exceed capacity

### Capacity Maintenance

- Maintain Capacity to maximize Energy
- Exercise improves Capacity (and thus Energy)
- Balance Work with rest
- Prevent Burnout (severe Energy restriction)

### Action Selection

- Choose actions based on Energy budget
- High-cost actions require planning
- Low-cost actions fill remaining Energy
- Balance across action categories

---

## Design Intent

Energy creates scarcity.

It forces prioritization.

Capacity modifies Energy availability.

Low Capacity severely restricts Energy.

High Capacity provides bonus Energy.

Energy cannot be hoarded or bypassed.

Energy is the foundation of all decisions.





