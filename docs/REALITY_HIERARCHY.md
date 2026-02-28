# Reality Hierarchy Documentation

## Overview

The Life World OS implements a strict hierarchical ontology with **REALITY** as the single immutable root. Under REALITY there are exactly **seven primary nodes**: Constraints of Reality, Environments, Resources, Infrastructure, Agents, Value, and Systems. States exist only under Agents or Systems. Capabilities are constraint-breaking mechanisms with a defined structure (Constraints Overcome, Inputs Required, Outputs Produced, Leverage Multiplier, Metrics). No duplication across categories—e.g. Trust as Resource, System, or Value dimension is intentionally distinct.

## Hierarchy Structure

```
REALITY (immutable root, displayed as "ROOT")
│
├── CONSTRAINTS_OF_REALITY
│   ├── PHYSICAL
│   ├── BIOLOGICAL
│   ├── INFORMATIONAL
│   ├── ECONOMIC
│   ├── SOCIAL
│   ├── TEMPORAL
│   └── FORMALIZATIONS
│       ├── LAWS (Fundamental, Power, Biblical, Strategic, Systemic)
│       ├── PRINCIPLES (Strategic, Systemic, Cross-System)
│       ├── FRAMEWORKS
│       └── DERIVED_CONDITIONS (Scarcity, Trade-offs, Opportunity Cost, Irreversibility, Degrees of Freedom)
│
├── ENVIRONMENTS
│   ├── PHYSICAL
│   ├── DIGITAL
│   ├── ECONOMIC
│   ├── SOCIAL
│   ├── ORGANIZATIONAL
│   └── INFORMATIONAL
│
├── RESOURCES
│   ├── TIME
│   ├── ENERGY
│   ├── CAPITAL
│   ├── ATTENTION
│   ├── INFORMATION
│   └── TRUST
│
├── INFRASTRUCTURE
│   └── (placeholder)
│
├── AGENTS
│   ├── HUMAN
│   │   ├── STATES
│   │   ├── CAPABILITIES (each: Constraints Overcome, Inputs Required, Outputs Produced, Leverage Multiplier, Metrics)
│   │   └── METRICS
│   ├── ARTIFICIAL
│   │   ├── STATES
│   │   ├── CAPABILITIES
│   │   └── METRICS
│   ├── COLLECTIVE
│   │   ├── STATES
│   │   ├── CAPABILITIES
│   │   └── METRICS
│   ├── ORGANISATIONAL
│   │   ├── STATES
│   │   ├── CAPABILITIES
│   │   └── METRICS
│   └── HYBRID
│       ├── STATES
│       ├── CAPABILITIES
│       └── METRICS
│
├── VALUE
│   ├── FINANCIAL
│   ├── INFLUENCE
│   ├── KNOWLEDGE
│   ├── HEALTH
│   ├── STABILITY
│   ├── OPTIONALITY
│   └── POWER
│
└── SYSTEMS
    ├── FINANCE (States + Universal Concept: MONEY)
    ├── CAREER (States + Universal Concept: CAREER)
    ├── TRUST (States + Universal Concept: TRUST)
    ├── HEALTH (States + Universal Concept: BIOLOGY; Energy States under Health States)
    ├── PRODUCTION (States + Universal Concept: PRODUCTION)
    ├── GOVERNANCE (States + Universal Concept: GOVERNANCE)
    └── CREATION (States + Universal Concept: CREATION)
```

## Invariants

1. **REALITY is the single root** — Only one node has `nodeType === 'REALITY'` and no parent.
2. **Exactly seven primary nodes** — Constraints of Reality, Environments, Resources, Infrastructure, Agents, Value, Systems.
3. **States only under Agents or Systems** — No States branch under Constraints, Environments, Resources, Infrastructure, or Value.
4. **Capabilities** — Defined as constraint-breaking mechanisms with metadata: Constraints Overcome, Inputs Required, Outputs Produced, Leverage Multiplier, Metrics.
5. **No duplication** — Trust (Resource) vs Trust (System) vs Value dimensions are distinct nodes with clear descriptions.

## Universal Concepts per System

Each system under SYSTEMS has:

- A **States** branch (node type STATE).
- A **Universal Concept** node (e.g. MONEY for Finance, BIOLOGY for Health) under which:
  - LAWS, PRINCIPLES, FRAMEWORKS branches reference global nodes under CONSTRAINTS_OF_REALITY → FORMALIZATIONS.
  - System-specific pathway nodes (e.g. ENERGY, NEUROSCIENCE for Health).

The mapping from system ID to laws/principles/frameworks is in `apps/backend/src/config/systemUniversalConceptConfig.ts`.

## Key Files

| Area        | File |
|------------|------|
| Seed       | `apps/backend/src/scripts/seedRealityHierarchy.ts` |
| Schema     | `apps/backend/prisma/schema.prisma` (RealityNode, RealityNodeType, RealityNodeCategory) |
| Config     | `apps/backend/src/config/systemUniversalConceptConfig.ts` |
| Energy States | `apps/backend/src/scripts/seedEnergyStates.ts` (under Systems → Health → States) |
| Tree output | `docs/REALITY_TREE.md` |

## Acceptance Criteria

- **A/C 1:** When viewing the life world reality hierarchy tree, the new ontology is visible (seven primary nodes and full sub-structure).
- **A/C 2:** When viewing the ontology in universal concepts for each system, the updated structure is visible (States, Universal Concept with LAWS/PRINCIPLES/FRAMEWORKS, pathways).
