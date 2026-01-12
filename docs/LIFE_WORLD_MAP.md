# Life World Map

## One-Page Visual Reference

```
                    LIFE WORLD OS
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║              OVERALL RANK & LEVEL                 ║
    ║         [Recruit → Command Sergeant Major]         ║
    ║                                                   ║
    ╠═══════════════════════════════════════════════════╣
    ║                                                   ║
    ║            CLOUDS OF LIFE (Background)            ║
    ║                                                   ║
    ║    ┌──────────┐  ┌──────────┐  ┌──────────┐    ║
    ║    │ Capacity │  │ Engines  │  │ Oxygen   │    ║
    ║    │  Cloud   │  │  Cloud   │  │  Cloud   │    ║
    ║    │  (0-100) │  │  (0-100) │  │  (0-100) │    ║
    ║    └──────────┘  └──────────┘  └──────────┘    ║
    ║                                                   ║
    ║    ┌──────────┐  ┌──────────┐                    ║
    ║    │ Meaning  │  │Optionality│                   ║
    ║    │  Cloud   │  │  Cloud   │                   ║
    ║    │  (0-100) │  │  (0-100) │                   ║
    ║    └──────────┘  └──────────┘                   ║
    ║                                                   ║
    ╠═══════════════════════════════════════════════════╣
    ║                                                   ║
    ║            CURRENT SEASON                         ║
    ║    [Spring] [Summer] [Autumn] [Winter]            ║
    ║                                                   ║
    ╠═══════════════════════════════════════════════════╣
    ║                                                   ║
    ║            RESOURCES                              ║
    ║                                                   ║
    ║    Oxygen: X.X months  │  Water: XX%             ║
    ║    Gold: $X,XXX        │  Armor: XX%             ║
    ║    Keys: X             │                         ║
    ║                                                   ║
    ╠═══════════════════════════════════════════════════╣
    ║                                                   ║
    ║            CATEGORY XP & LEVELS                   ║
    ║                                                   ║
    ║    Capacity:  X,XXX XP (Lv XX)                    ║
    ║    Engines:   X,XXX XP (Lv XX)                    ║
    ║    Oxygen:    X,XXX XP (Lv XX)                    ║
    ║    Meaning:   X,XXX XP (Lv XX)                    ║
    ║    Optionality: X,XXX XP (Lv XX)                  ║
    ║                                                   ║
    ║    [Balance Indicator: ⚠️ Warning if imbalanced]  ║
    ║                                                   ║
    ╠═══════════════════════════════════════════════════╣
    ║                                                   ║
    ║            ENGINES                                ║
    ║                                                   ║
    ║    [Career] [Business] [Investment] [Learning]   ║
    ║    Status: Active/Inactive/Planning              ║
    ║    Fragility: 0-100 (lower = more fragile)       ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
```

## Key Relationships

### Clouds → Resources
- **Capacity Cloud** affects **Water** resource
- **Engines Cloud** affects **Oxygen** resource
- **Oxygen Cloud** affects **Oxygen** resource directly
- **Optionality Cloud** affects **Keys** resource

### Resources → Constraints
- **Water < 20**: Forces Winter season
- **Water < 30**: Blocks progression, prevents Summer
- **Oxygen < 3 months**: Blocks expansion

### Seasons → XP Multipliers
- **Spring**: +1.2x Learning/Planning
- **Summer**: +1.3x Work/Revenue
- **Autumn**: +1.2x Optimization/Teaching
- **Winter**: +1.1x Rest/Reflection

### XP → Progression
- **Overall XP** → Overall Rank & Level
- **Category XP** → Category Levels
- **Balance** → Warnings & Recommendations

### Engines → Resources
- **Career Engine** → Oxygen (salary)
- **Business Engine** → Oxygen + Gold
- **Investment Engine** → Oxygen (passive) + Gold growth
- **Learning Engine** → XP + Keys

## Flow Diagram

```
User Action
    ↓
Activity Recorded
    ↓
XP Calculated (Overall + Categories)
    ↓
Season Multiplier Applied
    ↓
XP Updated → Rank/Level Checked
    ↓
Resources Updated (if applicable)
    ↓
Milestones Checked
    ↓
Balance Indicator Updated
    ↓
Dashboard Refreshed
```

## System Rules Flow

```
Season Transition Request
    ↓
Check: Minimum Duration? (4 weeks)
    ↓
Check: Water Level? (< 20 = Winter only, < 30 = No Summer)
    ↓
Check: Current Season? (Winter → Spring only)
    ↓
If Valid: Record History → Update Season
    ↓
If Invalid: Return Error with Reason
```





