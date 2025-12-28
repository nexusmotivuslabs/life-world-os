# Navigation Architecture

**Status**: ✅ Active  
**Last Updated**: 2025-01-15

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────┐
│   Application Components             │
│   - Use useNavigation() hook         │
│   - Access breadcrumbs               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   useNavigation() Hook               │
│   - Wraps React Router               │
│   - Provides breadcrumbs              │
│   - Route helpers                     │
└──────────────┬──────────────────────┘
               │
       ┌────────┴────────┐
       │                 │
┌──────▼──────┐  ┌───────▼────────┐
│ React Router│  │ Route Config   │
│ - URL mgmt  │  │ - routes.ts    │
│ - Routing   │  │ - Metadata     │
│ - Hooks     │  │ - Hierarchy    │
└─────────────┘  └────────────────┘
```

### Component Layers

#### 1. Route Configuration Layer
**Location**: `config/routes.ts`

- Defines all routes with metadata
- Provides route helper functions
- Single source of truth for routes
- Type-safe route definitions

#### 2. Navigation Hook Layer
**Location**: `hooks/useNavigation.ts`

- Primary API for navigation
- Wraps React Router hooks
- Provides breadcrumb generation
- Route helper methods

#### 3. Navigation Service Layer
**Location**: `services/navigationService.ts`

- Navigation hierarchy management
- Breadcrumb path generation
- Node-based navigation structure

#### 4. UI Components Layer
**Location**: `components/`

- `Layout.tsx`: Wraps authenticated routes
- `Header.tsx`: Main navigation header
- `Breadcrumbs.tsx`: Breadcrumb display

#### 5. Route Definition Layer
**Location**: `App.tsx`

- React Router route definitions
- Component-to-route mapping
- Layout application

---

## Data Flow

### Navigation Flow

```
User Action
    ↓
Component calls useNavigation().navigateTo()
    ↓
Hook calls React Router navigate()
    ↓
URL changes
    ↓
React Router renders new component
    ↓
useNavigation() hook detects location change
    ↓
Breadcrumbs updated automatically
```

### Breadcrumb Generation Flow

```
Current URL Path
    ↓
useNavigation() gets location.pathname
    ↓
buildBreadcrumbs() looks up route in routes.ts
    ↓
Follows parent chain to build breadcrumb trail
    ↓
Returns breadcrumb array
    ↓
Breadcrumbs component renders trail
```

---

## Route Hierarchy

### Current Structure

```
/ (Home)
├── /tiers (System Tiers)
│   ├── /choose-plane
│   │   ├── /knowledge (Knowledge Plane)
│   │   │   ├── /knowledge/search
│   │   │   ├── /knowledge/laws
│   │   │   ├── /knowledge/constraints
│   │   │   ├── /knowledge/overview
│   │   │   └── /knowledge/meaning
│   │   ├── /systems (Systems Plane)
│   │   │   ├── /admin
│   │   │   └── /dashboard (legacy → redirects to /systems)
│   │   └── /loadouts
│   └── /explore (redirects to /tiers)
│       ├── /master/:domain
│       │   └── /master/:domain/products/:productId
│       └── /system-health/:systemId/:view
└── /artifacts
```

### Route Categories

1. **Public Routes**: No authentication required
   - `/`, `/login`, `/register`

2. **Authenticated Routes**: Require authentication
   - All routes under `/choose-plane`
   - All `/master/*` routes
   - `/admin`, `/loadouts`

3. **Legacy Routes**: Redirects to new routes
   - `/dashboard` → `/systems`
   - `/explore` → `/tiers`
   - `/knowledge/awareness` → `/knowledge/meaning`

---

## State Management (Future Enhancement)

### Planned Zustand Integration

```typescript
// Future: store/useNavigationStore.ts
interface NavigationState {
  currentPath: string
  previousPath: string | null
  history: string[]
  navigateTo: (path: string) => void
  goBack: () => void
  // ... analytics, guards, etc.
}
```

### Benefits of State Management

- Navigation history tracking
- Analytics capabilities
- Navigation guards/interceptors
- Programmatic navigation control
- Better testing capabilities

---

## Type Safety

### Route Configuration Types

```typescript
interface RouteConfig {
  path: string
  label: string
  parent?: string
  icon?: ComponentType<{ className?: string }>
  requiresAuth?: boolean
  description?: string
}
```

### Navigation Hook Types

```typescript
interface NavigationHook {
  currentPath: string
  breadcrumbs: RouteConfig[]
  navigateToMaster: (domain: MasterDomain) => void
  navigateToMasterProduct: (domain: MasterDomain, productId: string) => void
  navigateTo: (path: string) => void
  goBack: () => void
}
```

---

## Extension Points

### Adding New Routes

1. Add route definition to `config/routes.ts`
2. Add route component to `App.tsx`
3. Update parent-child relationships
4. Test breadcrumb generation

### Adding Navigation Features

1. Extend `useNavigation()` hook
2. Add to route configuration if needed
3. Update components to use new features
4. Document in this architecture doc

---

## Related Documentation

- [Patterns](./PATTERNS.md) - Detailed pattern explanation
- [Route Configuration](./ROUTE_CONFIGURATION.md) - How to define routes
- [Best Practices](./BEST_PRACTICES.md) - Guidelines

---

**Maintained By**: Frontend Engineering Team  
**Review Cycle**: Quarterly


