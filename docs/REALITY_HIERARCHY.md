# Reality Hierarchy Documentation

## Overview

The Life World OS implements a strict hierarchical ontology with **REALITY** as the single immutable root. All laws, principles, and frameworks trace back to REALITY, providing a complete ontological view that supports artifacts and knowledge organization.

## Hierarchy Structure

```
REALITY (immutable root, displayed as "ROOT")
│
├── CONSTRAINTS_OF_REALITY (immutable, FOUNDATIONAL)
│   ├── LAWS (immutable, FOUNDATIONAL)
│   │   ├── Fundamental Laws (FUNDAMENTAL)
│   │   │   ├── LAW_OF_COMPOUNDING
│   │   │   ├── LAW_OF_ENTROPY
│   │   │   ├── LAW_OF_TIME
│   │   │   ├── LAW_OF_ENERGY
│   │   │   └── LAW_OF_CAUSE_EFFECT
│   │   ├── 48 Laws of Power (POWER)
│   │   │   └── [Organized by domain: MONEY, ENERGY, etc.]
│   │   ├── Bible Laws (BIBLICAL)
│   │   │   └── [Organized by domain: MONEY, INVESTMENT, ENERGY, etc.]
│   │   ├── Strategic Laws (STRATEGIC)
│   │   │   ├── LAW_OF_LEVERAGE
│   │   │   └── LAW_OF_MARGIN_OF_SAFETY
│   │   └── Systemic Laws (SYSTEMIC)
│   │       ├── LAW_OF_FEEDBACK_LOOPS
│   │       └── LAW_OF_FIRST_PRINCIPLES
│   │
│   ├── PRINCIPLES (immutable, FOUNDATIONAL)
│   │   ├── Strategic Principles (STRATEGIC)
│   │   │   ├── LEVERAGE
│   │   │   ├── MARGIN_OF_SAFETY
│   │   │   ├── INVERSION
│   │   │   ├── OPPORTUNITY_COST
│   │   │   └── SYSTEMS_THINKING
│   │   ├── Systemic Principles (SYSTEMIC)
│   │   │   ├── FIRST_PRINCIPLES
│   │   │   ├── FEEDBACK_LOOPS
│   │   │   ├── EMERGENCE
│   │   │   ├── ADAPTATION
│   │   │   └── HIERARCHY
│   │   └── Cross-System Modifiers (CROSS_SYSTEM)
│   │       ├── TRUST (principle + modifier)
│   │       ├── REPUTATION (principle + modifier)
│   │       ├── OPTIONALITY (principle + modifier)
│   │       └── ENERGY_RESERVE (principle + modifier)
│   │
│   └── FRAMEWORKS (immutable, FOUNDATIONAL)
│       ├── Pareto Principle (80/20 Rule) (STRATEGIC)
│       └── Domain Application Framework (STRATEGIC)
│
├── AGENTS (immutable, FOUNDATIONAL)
│   └── [Agent types and capabilities]
│
├── ENVIRONMENTS (immutable, FOUNDATIONAL)
│   └── [Environment types]
│
├── RESOURCES (immutable, FOUNDATIONAL)
│   └── ENGINES
│       └── [Engine types]
│
├── VALUE (immutable, FOUNDATIONAL)
│   └── FINANCE (system)
│       └── [Finance categories]
│
└── SYSTEMS (immutable, FOUNDATIONAL) ⭐ NEW
    ├── SURVIVAL_TIER
    │   └── HEALTH
    │       └── [Sub-systems: Capacity, Recovery, Resilience]
    │
    ├── STABILITY_TIER
    │   ├── MONEY
    │   │   └── [Sub-systems: Products, Agents, Teams]
    │   └── ENERGY
    │       └── [Sub-systems: States, Levels, Buffs]
    │
    ├── GROWTH_TIER
    │   ├── INVESTMENT
    │   └── TRAINING
    │
    ├── LEVERAGE_TIER
    │   └── [Future systems]
    │
    ├── EXPRESSION_TIER
    │   ├── TRAVEL
    │   └── MEANING
    │
    └── CROSS_SYSTEM_STATES
        ├── TRUST (system node)
        ├── REPUTATION (system node)
        ├── OPTIONALITY (system node)
        └── ENERGY_RESERVE (system node)
```

## Category System

Laws and principles are organized using a **category field** that replaces the previous weight-based system (super_heavy, heavy, light). Categories provide semantic meaning and enable better organization.

### Category Types

- **FOUNDATIONAL** - Core structure nodes (REALITY, CONSTRAINTS_OF_REALITY, LAWS, PRINCIPLES, FRAMEWORKS, SYSTEMS)
- **FUNDAMENTAL** - Basic immutable laws that govern reality (Compounding, Entropy, Time, Energy, Cause-Effect)
- **POWER** - 48 Laws of Power applied across domains
- **BIBLICAL** - Bible Laws and biblical principles applied across domains
- **STRATEGIC** - Strategic principles and frameworks (Leverage, Margin of Safety, Inversion, Pareto Principle)
- **SYSTEMIC** - Systemic principles (First Principles, Feedback Loops, Emergence, Adaptation, Hierarchy)
- **CROSS_SYSTEM** - Cross-system state modifiers (Trust, Reputation, Optionality, Energy Reserve) - act as both principles and system modifiers
- **SYSTEM_TIER** - System tier categories (Survival, Stability, Growth, Leverage, Expression, Cross-System States)
- **SYSTEM** - Individual systems and sub-systems (Health, Money, Energy, etc.)

## Database Schema

### PowerLaw Model

```prisma
model PowerLaw {
  id                  String         @id @default(uuid())
  lawNumber           Int
  title               String
  originalDescription String
  domain              PowerLawDomain
  domainApplication   String
  category            String?        // NEW: Category field
  strategies          Json
  examples            Json?
  warnings            Json?
  counterStrategies   Json?
  order               Int
  createdAt           DateTime
  updatedAt           DateTime

  @@unique([domain, lawNumber])
  @@index([domain])
  @@index([lawNumber])
  @@index([category])  // NEW: Index on category
}
```

### BibleLaw Model

```prisma
model BibleLaw {
  id                    String         @id @default(uuid())
  lawNumber             Int
  title                 String
  scriptureReference    String
  originalText          String?
  domain                BibleLawDomain
  domainApplication     String
  category              String?        // NEW: Category field
  principles            Json
  practicalApplications Json
  examples              Json?
  warnings              Json?
  relatedVerses         Json?
  order                 Int
  createdAt             DateTime
  updatedAt             DateTime

  @@unique([domain, lawNumber])
  @@index([domain])
  @@index([lawNumber])
  @@index([category])  // NEW: Index on category
}
```

## API Endpoints

### Power Laws

- `GET /api/power-laws` - List all power laws (optional filters: `domain`, `category`)
- `GET /api/power-laws/domains` - Get all domains with counts
- `GET /api/power-laws/categories` - Get all categories with counts (NEW)
- `GET /api/power-laws/:id` - Get specific law by ID
- `GET /api/power-laws/by-number/:lawNumber` - Get law by number and domain

### Bible Laws

- `GET /api/bible-laws` - List all Bible laws (optional filters: `domain`, `category`)
- `GET /api/bible-laws/domains` - Get all domains with counts
- `GET /api/bible-laws/categories` - Get all categories with counts (NEW)
- `GET /api/bible-laws/:id` - Get specific law by ID
- `GET /api/bible-laws/by-number/:lawNumber` - Get law by number and domain

## Frontend Integration

The hierarchy tree is displayed in the Knowledge Plane under "Hierarchy Tree" (`/knowledge/hierarchy`). The component:

- Shows the complete hierarchy from REALITY down to individual laws
- Supports expandable/collapsible nodes
- Displays category badges for visual organization
- Shows immutable indicators for foundational nodes
- Supports artifacts (ready for future expansion)

## Artifact Support

The hierarchy structure is designed to support artifacts. The `TreeNode` interface includes an `artifact` type, and the structure can be extended to include:

- Artifacts linked to specific laws or principles
- Artifact collections organized by category
- Artifact metadata and relationships

## Migration Notes

### From Weight-Based to Category-Based

The previous system used weight descriptors (super_heavy, heavy, light) to organize laws. The new system uses semantic categories:

- **Old**: Weight-based organization (super_heavy, heavy, light)
- **New**: Category-based organization (FOUNDATIONAL, FUNDAMENTAL, POWER, BIBLICAL, STRATEGIC, SYSTEMIC)

### Data Migration

When migrating existing data:
1. All existing Power Laws are assigned `category: 'POWER'`
2. All existing Bible Laws are assigned `category: 'BIBLICAL'`
3. Fundamental laws are explicitly created with `category: 'FUNDAMENTAL'`
4. Strategic and Systemic laws are explicitly created with their respective categories

## Key Invariants

1. **REALITY is the single root** - Only one node has `type === 'reality'` and no parent
2. **All nodes trace to REALITY** - Every law, principle, and framework must have a valid path to REALITY
3. **Categories are semantic** - Categories provide meaning, not just weight/importance
4. **Immutable foundational nodes** - REALITY, CONSTRAINTS_OF_REALITY, LAWS, PRINCIPLES, FRAMEWORKS are immutable
5. **Category consistency** - All laws within a category share semantic meaning

## Future Extensions

The structure supports:
- **Artifacts** - Knowledge artifacts linked to laws and principles
- **Relationships** - Cross-references between laws, principles, and frameworks
- **Versioning** - Historical versions of laws and principles
- **Annotations** - User annotations and notes on laws
- **Collections** - Curated collections of laws by theme or application


