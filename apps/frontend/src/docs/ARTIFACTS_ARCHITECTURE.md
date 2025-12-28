# Artifacts Architecture

## Overview

The **Artifacts system** provides a unified, read-only view of all viewable entities across the Life World OS. It serves as the **source of truth** for discovering and understanding all artifacts in the system.

## Architectural Principles

### 1. Knowledge as Source of Truth for Viewing

- **Location**: `/knowledge/artifacts` (Knowledge Plane)
- **Purpose**: Central repository for viewing ALL artifacts across all systems
- **Responsibility**: Read-only discovery and navigation
- **Not responsible for**: Creation, modification, or deletion of artifacts

### 2. System-Managed Artifacts

Each system (Money, Energy, Loadout, etc.) is responsible for:
- Creating and managing its own artifact data
- Providing APIs for artifact retrieval
- Enforcing business logic and validation
- Persisting artifact state

The Knowledge Plane **aggregates** these artifacts for unified viewing.

### 3. Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                     Knowledge Plane                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Artifacts View (Source of Truth)            │   │
│  │                                                       │   │
│  │  • Aggregates artifacts from all systems            │   │
│  │  • Provides search & filtering                      │   │
│  │  • Read-only view                                   │   │
│  │  • Links to system-specific management              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ▲                                 │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│ Money System  │   │Loadout System│   │Energy System │
│               │   │              │   │              │
│ Manages:      │   │ Manages:     │   │ Manages:     │
│ • Products    │   │ • Weapons    │   │ • States     │
│ • Agents      │   │ • Items      │   │ • Levels     │
│ • Teams       │   │ • Slots      │   │ • Buffs      │
└───────────────┘   └──────────────┘   └──────────────┘
```

### 4. Artifacts Over Heroics

**Core Principle**: Heroics fade. Artifacts persist.

Artifacts are the durable outputs that outlive individual efforts and heroic moments. They represent the accumulated knowledge, systems, and components that form the foundation of sustainable progress.

## Tech Artifacts

Tech Artifacts are the fundamental building blocks that persist across time and relationships. They represent the tangible, reusable, and measurable outputs of technical work that transcend individual contributions.

### Artifact Types

#### 1. Documents

**Definition**: Persistent written knowledge that captures decisions, designs, processes, and understanding.

**Tech Application**:
- Architecture Decision Records (ADRs)
- API documentation and specifications
- System design documents
- Runbooks and operational procedures
- Technical specifications and RFCs

**Cross-Domain Relationships**:
- **Finance**: Financial models, accounting procedures, audit documentation
- **Business**: Business plans, strategy documents, process workflows
- **Health**: Medical protocols, treatment guidelines, research papers
- **Legal**: Contracts, compliance documentation, policy frameworks
- **Education**: Curriculum documents, learning materials, assessment rubrics

**World Relationship** (5+ domains): When documents span tech, finance, business, health, and legal domains, they become **world documents**—comprehensive knowledge artifacts that integrate multiple perspectives and serve as universal references.

#### 2. Metrics

**Definition**: Quantifiable measures that track performance, health, and progress over time.

**Tech Application**:
- System performance metrics (latency, throughput, error rates)
- Code quality metrics (test coverage, complexity, technical debt)
- Deployment metrics (deployment frequency, lead time, MTTR)
- User engagement metrics (DAU, retention, conversion rates)
- Infrastructure metrics (CPU, memory, network utilization)

**Cross-Domain Relationships**:
- **Finance**: Revenue metrics, profit margins, ROI, burn rate
- **Business**: KPIs, customer satisfaction scores, market share
- **Health**: Vital signs, recovery rates, treatment effectiveness
- **Operations**: Efficiency metrics, capacity utilization, SLA compliance
- **Research**: Statistical measures, experimental results, validation metrics

**World Relationship** (5+ domains): When metrics integrate across tech, finance, business, health, and operations, they form **world metrics**—holistic measurement frameworks that provide comprehensive system health and performance visibility.

#### 3. Systems

**Definition**: Organized structures with defined rules, interactions, and boundaries that produce consistent outcomes.

**Tech Application**:
- Software systems and architectures
- Microservices and distributed systems
- CI/CD pipelines and automation systems
- Monitoring and observability systems
- Data processing and analytics systems

**Cross-Domain Relationships**:
- **Finance**: Payment systems, accounting systems, trading platforms
- **Business**: CRM systems, ERP systems, supply chain management
- **Health**: Electronic health records, telemedicine platforms, diagnostic systems
- **Education**: Learning management systems, assessment platforms, student information systems
- **Government**: Public service systems, voting systems, regulatory compliance systems

**World Relationship** (5+ domains): When systems integrate across tech, finance, business, health, and government domains, they become **world systems**—comprehensive platforms that enable cross-domain operations and unified experiences.

#### 4. Reusable Components

**Definition**: Modular, well-defined pieces that can be composed and reused across different contexts and projects.

**Tech Application**:
- UI component libraries (React components, design systems)
- API clients and SDKs
- Utility libraries and shared functions
- Infrastructure as Code templates
- Docker images and containerized services
- Authentication and authorization modules

**Cross-Domain Relationships**:
- **Finance**: Payment processing components, financial calculation libraries
- **Business**: Reporting components, dashboard widgets, workflow engines
- **Health**: Medical device interfaces, health data processing modules
- **Legal**: Compliance checking components, contract template engines
- **Communication**: Messaging components, notification systems, collaboration tools

**World Relationship** (5+ domains): When components are designed to work across tech, finance, business, health, and legal domains, they become **world components**—universal building blocks that enable rapid development across multiple domains.

#### 5. Recorded Decisions

**Definition**: Captured rationale, context, and outcomes of important choices that inform future decisions.

**Tech Application**:
- Architecture Decision Records (ADRs)
- Technology selection decisions
- Design pattern choices
- Trade-off analyses
- Post-mortem reports and lessons learned
- Code review decisions and rationale

**Cross-Domain Relationships**:
- **Finance**: Investment decisions, budget allocation rationale, cost-benefit analyses
- **Business**: Strategic decisions, market entry choices, partnership evaluations
- **Health**: Treatment protocol decisions, research methodology choices
- **Legal**: Compliance strategy decisions, risk mitigation approaches
- **Operations**: Process improvement decisions, tool selection rationale

**World Relationship** (5+ domains): When decisions span tech, finance, business, health, and legal domains, they become **world decisions**—strategic choices that consider multiple perspectives and create alignment across domains.

### Relationship Classification

**Domain-Specific Artifacts**: Artifacts that primarily serve a single domain (e.g., tech-only, finance-only).

**Cross-Domain Artifacts**: Artifacts that serve 2-4 related domains (e.g., tech + finance, business + health).

**World Artifacts**: Artifacts that span 5+ domains (tech, finance, business, health, legal, etc.). These represent the highest level of integration and universality.

### Artifact Persistence

Unlike heroics—individual acts of exceptional effort that fade with time—artifacts persist because they:

1. **Outlive Individuals**: Documents, systems, and components remain after people move on
2. **Accumulate Value**: Each artifact builds on previous ones, creating compound knowledge
3. **Enable Reuse**: Components and systems can be leveraged across projects and domains
4. **Provide Evidence**: Metrics and recorded decisions create an audit trail of progress
5. **Scale Impact**: Well-designed artifacts amplify the impact of future work

### Artifact Quality Principles

1. **Discoverability**: Artifacts should be easy to find and understand
2. **Reusability**: Components and systems should be designed for multiple use cases
3. **Measurability**: Metrics should provide actionable insights
4. **Traceability**: Decisions should link to context and outcomes
5. **Maintainability**: Documents and systems should evolve with changing needs

## Artifact Sources

### Current Implementation

#### 1. Static Artifacts (Defined in `ArtifactsView.tsx`)

These are core concepts that rarely change:

**Resources:**
- Energy
- Money (Gold)
- Oxygen
- Water
- Armor
- Keys

**Stats:**
- Capacity
- Engines
- Meaning
- Optionality

**Systems:**
- Money System
- Energy System

**Concepts:**
- Tier System

**Laws:**
- 48 Laws of Power
- Bible Laws

#### 2. Dynamic Artifacts (Fetched from APIs)

**Weapons (from Loadout System):**
- Source: `/api/loadout-items` endpoint
- Managed by: Loadout System
- Category: `WEAPON`
- Count: 20+ items
- Features: Power levels, benefits, XP mapping, synergies

### Future Expansion

The following could be added as artifact sources:

1. **Reality Nodes** (from Knowledge/Reality System)
   - Laws, Principles, Agents, Environments
   - Category: `LAW`, `PRINCIPLE`, `CONCEPT`

2. **Training Modules** (from Training System)
   - Category: `CONCEPT` or new `TRAINING` category

3. **Awareness Layers** (from Meaning System)
   - Category: `CONCEPT`

4. **Health Knowledge** (from Health System)
   - Category: `CONCEPT` or new `HEALTH` category

## Data Flow

```
1. User navigates to /knowledge/artifacts
                    ↓
2. ArtifactsView component loads
                    ↓
3. Static artifacts loaded immediately (from artifacts array)
                    ↓
4. Dynamic artifacts fetched asynchronously:
   - Weapons from loadoutApi.getLoadoutItems()
                    ↓
5. Artifacts aggregated in allArtifacts useMemo
                    ↓
6. User applies filters (category, search)
                    ↓
7. filteredArtifacts computed based on filters
                    ↓
8. Artifacts displayed in grid with category cards
```

## Categories

All artifacts are categorized using `ArtifactCategory` enum:

| Category | Color | Description | Example Count |
|----------|-------|-------------|---------------|
| RESOURCE | Green | Assets and consumables | 6 |
| STAT | Pink | Measurable attributes | 4 |
| SYSTEM | Blue | Organized structures | 2 |
| CONCEPT | Purple | Abstract ideas | 1 |
| LAW | Orange | Immutable rules | 2 |
| PRINCIPLE | Cyan | Fundamental truths | 0 (future) |
| FRAMEWORK | Indigo | Structured approaches | 0 (future) |
| WEAPON | Red | Capabilities and tools | 20+ |

## User Interface

### Filter System

1. **Visual Grid Layout**
   - 5-column responsive grid (2-5 columns based on screen size)
   - Color-coded category cards
   - Item count badges
   - Selection indicators (checkmark)

2. **Search Functionality**
   - Full-text search across name, description, details, tags
   - Real-time filtering

3. **Active Filter Display**
   - Shows currently selected category
   - Displays filtered item count
   - Quick "Clear filter" button

4. **Glossary Sidebar**
   - Always-visible reference
   - Definitions for all categories
   - Sticky positioning

## Navigation

Artifacts provide links to system-specific management:

- Click **Money System** → Navigate to `/money`
- Click **Energy System** → Navigate to `/energy`
- Click **Weapons** → Navigate to `/loadout`
- Click **Laws** → Navigate to `/knowledge/laws`

Each artifact card has a "Click to explore" prompt for navigable items.

## API Integration

### Current APIs Used

```typescript
// Loadout API - Fetches weapons/loadout items
import { loadoutApi } from '../services/loadoutApi'

// Usage in ArtifactsView
const items = await loadoutApi.getLoadoutItems()
```

### Future API Integrations

```typescript
// Example: Reality Nodes API
const realityNodes = await realityNodeApi.getNodes({ ... })

// Example: Training Modules API
const trainingModules = await trainingApi.getModules()

// Example: Awareness Layers API
const awarenessLayers = await meaningApi.getAwarenessLayers()
```

## Component Structure

```
ArtifactsView/
├── Header
│   ├── Title + "Source of Truth" badge
│   ├── Description
│   └── Architecture note
├── Search Bar
├── Filter Section
│   ├── Category Grid (8 categories)
│   └── Active Filter Display
├── Artifacts Grid (3 columns)
│   └── Artifact Cards
│       ├── Icon
│       ├── Category Badge
│       ├── Name
│       ├── Description
│       └── Details List
└── Glossary Sidebar (sticky)
    ├── Resources
    ├── Stats
    ├── Systems
    ├── Concepts
    └── Game Mechanics
```

## Code Organization

### Key Files

```
frontend/src/
├── components/
│   └── ArtifactsView.tsx          # Main artifacts component
├── types/
│   └── artifact.ts                # Category enums, metadata, colors
├── services/
│   └── loadoutApi.ts              # API for fetching weapons
└── docs/
    └── ARTIFACTS_ARCHITECTURE.md  # This file
```

### Type Definitions

```typescript
// Artifact interface
interface Artifact {
  id: string
  name: string
  description: string
  category: ArtifactCategory
  icon: React.ComponentType
  route?: string        // Navigation target
  details?: string[]    // Bullet points
  tags?: string[]       // Search tags
}

// Category enum
enum ArtifactCategory {
  RESOURCE = 'RESOURCE',
  STAT = 'STAT',
  SYSTEM = 'SYSTEM',
  CONCEPT = 'CONCEPT',
  LAW = 'LAW',
  PRINCIPLE = 'PRINCIPLE',
  FRAMEWORK = 'FRAMEWORK',
  WEAPON = 'WEAPON',
}
```

## Best Practices

### Adding New Artifacts

#### Static Artifacts
1. Add to `artifacts` array in `ArtifactsView.tsx`
2. Assign appropriate `ArtifactCategory`
3. Provide icon, description, and details
4. Add navigation route if applicable

#### Dynamic Artifacts from New System
1. Create API endpoint in system's backend
2. Create API client in `frontend/src/services/`
3. Fetch in `useEffect` hook in `ArtifactsView`
4. Transform to `Artifact` interface
5. Add to `allArtifacts` useMemo

### Maintaining Separation of Concerns

✅ **DO:**
- Aggregate artifacts in Knowledge Plane
- Provide read-only view
- Link to system-specific management
- Keep artifact data in source systems

❌ **DON'T:**
- Create/modify artifacts in ArtifactsView
- Duplicate artifact data in Knowledge
- Mix management and viewing concerns

## Testing Checklist

When adding new artifacts:

- [ ] Artifacts display correctly in grid
- [ ] Category filter shows new category
- [ ] Item count is accurate
- [ ] Search finds new artifacts by name/description/tags
- [ ] Navigation links work correctly
- [ ] Glossary includes new category (if new)
- [ ] Loading state handled for async artifacts
- [ ] Error handling for failed API calls

## Future Enhancements

1. **Artifact Details Modal**
   - Full-screen detailed view
   - Rich metadata display
   - Inline actions (equip weapon, view law details)

2. **Artifact Relationships**
   - Show dependencies (e.g., weapon counters anger)
   - Display synergies (e.g., discipline + focus)

3. **Saved Artifacts**
   - User-specific favorites/bookmarks
   - Integrate with existing `SavedArtifactsView`

4. **Artifact History**
   - Track when artifacts were viewed
   - Show recently accessed artifacts

5. **Cross-System Search**
   - Search across artifacts AND content (laws, principles)
   - Unified search experience

## Conclusion

The Artifacts architecture establishes Knowledge as the **source of truth for viewing** while maintaining **system ownership of artifact data**. This separation ensures:

- **Clear responsibilities**: Systems manage, Knowledge displays
- **Scalability**: Easy to add new artifact sources
- **Maintainability**: Changes to artifacts don't affect Knowledge structure
- **User experience**: Unified discovery across all systems

