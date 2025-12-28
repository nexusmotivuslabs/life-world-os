# Navigation Framework - Hierarchical Ontology

## Overview

Life World OS uses a hierarchical ontology-based navigation system where each page represents a node in a tree structure. Navigation follows the pattern: **Home -> System Tiers -> [System] -> [Sub-System]**

## Navigation Hierarchy

```
Home (Root)
└── System Tiers
    ├── Survival Tier
    │   └── Health System
    ├── Stability Tier
    │   ├── Money System (inherent system)
    │   └── Energy System
    ├── Growth Tier
    │   └── Investment System
    ├── Leverage Tier
    │   └── [Future systems]
    └── Expression Tier
        └── Meaning System
```

## Current Node Tracking

The navigation system tracks the current node in the hierarchy:

- **Home** → Root node
- **System Tiers** → Tier overview node
- **System Tiers → Money** → System node (e.g., Money is an inherent system in Root 0)
- **System Tiers → Money → Products** → Sub-system node

## Implementation

### Navigation Node Structure

```typescript
interface NavigationNode {
  id: string
  title: string
  path: string
  parentId: string | null
  nodeType: 'root' | 'tier' | 'system' | 'subsystem'
  tier?: SystemTier
  metadata?: {
    description?: string
    icon?: string
    verification?: VerificationConfig
  }
}
```

### Breadcrumb Generation

Breadcrumbs are automatically generated from the navigation hierarchy:
- Home → System Tiers → [Current System]
- Each breadcrumb is clickable to navigate up the hierarchy
- Current node is highlighted in the breadcrumb chain

## Choose Plane as Silent Assistant

The "Choose Plane" functionality is now a contextual assistant (like Thanos/Ebony Maw) that:
- Provides contextual guidance based on current navigation node
- Combines local knowledge (app data) with root knowledge (external APIs) for verification
- Appears contextually rather than as a mandatory entry point
- Acts as a verification layer using combined knowledge sources

## Verification Framework

### Verification Sources

1. **Local Knowledge (App Data)**
   - Database records
   - User state
   - System configurations
   - Historical data

2. **Root Knowledge (External APIs)**
   - Real-time market data
   - External verification services
   - Public APIs
   - Third-party data sources

3. **Combined Verification**
   - Local + Root knowledge = Verified truth
   - Example: User's financial data (local) + Market rates (external) = Verified financial status

### Verification Integration Points

Documented for future integration:
- Financial data verification (Plaid, brokerage APIs)
- Market data verification (real-time pricing)
- Location verification (Google Places API)
- Health data verification (fitness APIs)
- Identity verification (OAuth providers)

## Navigation Flow

1. **User lands on Home** → Sees System Tiers overview
2. **User clicks System Tiers** → Sees tier hierarchy with systems
3. **User clicks a System** (e.g., Money) → Navigates to system page
   - Breadcrumb: Home → System Tiers → Money
4. **User navigates deeper** → Breadcrumb extends accordingly

## Developer Guidelines

### Adding New Systems

1. Define system in `ExploreSystems.tsx`
2. Add route in `App.tsx`
3. Update navigation hierarchy in `routes.ts`
4. Ensure breadcrumbs work correctly

### Verification Integration

When adding verification:
1. Document data source (local vs external)
2. Define verification logic
3. Add to verification framework
4. Update knowledge guides


