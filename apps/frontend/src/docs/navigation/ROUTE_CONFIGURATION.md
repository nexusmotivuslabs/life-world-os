# Route Configuration Guide

**Status**: ✅ Active  
**Last Updated**: 2025-01-15

---

## Overview

All routes in the application are defined in `config/routes.ts`. This is the **single source of truth** for route definitions, metadata, and navigation hierarchy.

---

## Route Configuration Structure

### RouteConfig Interface

```typescript
interface RouteConfig {
  path: string                    // URL path
  label: string                   // Display name
  parent?: string                 // Parent route path (for breadcrumbs)
  icon?: ComponentType            // Icon component
  requiresAuth?: boolean          // Authentication required
  description?: string           // Route description
}
```

### Example Route Definition

```typescript
export const routes: Record<string, RouteConfig> = {
  home: {
    path: '/',
    label: 'Home',
    icon: Home,
    requiresAuth: false,
  },
  knowledge: {
    path: '/knowledge',
    label: 'Knowledge Plane',
    parent: '/choose-plane',
    icon: BookOpen,
    requiresAuth: true,
    description: 'Read-only, interpretive systems for understanding',
  },
}
```

---

## Adding New Routes

### Step 1: Define Route in routes.ts

```typescript
// config/routes.ts
export const routes: Record<string, RouteConfig> = {
  // ... existing routes
  
  myNewRoute: {
    path: '/my-new-route',
    label: 'My New Route',
    parent: '/systems',  // Parent for breadcrumbs
    icon: Settings,       // Optional icon
    requiresAuth: true,   // Default: false
    description: 'Description of this route',
  },
}
```

### Step 2: Add Route Helper (if needed)

```typescript
// config/routes.ts
export const getMyNewRoute = (): string => '/my-new-route'
```

### Step 3: Add Route to App.tsx

```typescript
// App.tsx
import MyNewPage from './pages/MyNewPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... existing routes */}
        
        <Route 
          path="/my-new-route" 
          element={
            <Layout>
              <MyNewPage />
            </Layout>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}
```

### Step 4: Test Navigation

```typescript
// In your component
const { navigateTo } = useNavigation()

// Navigate to new route
navigateTo('/my-new-route')
```

---

## Route Categories

### Public Routes

Routes that don't require authentication:

```typescript
{
  path: '/',
  requiresAuth: false,  // or omit (defaults to false)
}
```

### Authenticated Routes

Routes that require authentication:

```typescript
{
  path: '/systems',
  requiresAuth: true,
}
```

### Dynamic Routes

Routes with parameters:

```typescript
{
  path: '/master/:domain',
  // Use route helper function
}

// Helper function
export const getMasterRoute = (domain: MasterDomain): string => 
  `/master/${domain}`
```

---

## Parent-Child Relationships

### Defining Hierarchy

Parent-child relationships are used for breadcrumb generation:

```typescript
{
  knowledge: {
    path: '/knowledge',
    parent: '/choose-plane',  // Parent route
  },
  knowledgeSearch: {
    path: '/knowledge/search',
    parent: '/knowledge',     // Child of /knowledge
  },
}
```

### Breadcrumb Generation

Breadcrumbs are automatically generated from parent chain:

```
/choose-plane → /knowledge → /knowledge/search
```

---

## Route Helper Functions

### Why Use Helpers?

- Type safety
- Centralized path management
- Easy refactoring
- Prevents typos

### Creating Route Helpers

```typescript
// Simple route
export const getHomeRoute = (): string => '/'

// Route with parameters
export const getMasterRoute = (domain: MasterDomain): string => 
  `/master/${domain}`

// Route with multiple parameters
export const getMasterProductRoute = (
  domain: MasterDomain, 
  productId: string
): string => `/master/${domain}/products/${productId}`
```

### Using Route Helpers

```typescript
// In components
import { getMasterRoute, MasterDomain } from '../config/routes'

const { navigateTo } = useNavigation()

// Use helper instead of hardcoded path
navigateTo(getMasterRoute(MasterDomain.MONEY))
```

---

## Route Metadata

### Icons

```typescript
import { BookOpen } from 'lucide-react'

{
  path: '/knowledge',
  icon: BookOpen,  // Icon component
}
```

### Descriptions

```typescript
{
  path: '/knowledge',
  description: 'Read-only, interpretive systems for understanding',
}
```

---

## Common Patterns

### Route Groups

Group related routes:

```typescript
// Knowledge plane routes
knowledge: { path: '/knowledge', ... },
knowledgeSearch: { path: '/knowledge/search', parent: '/knowledge' },
knowledgeLaws: { path: '/knowledge/laws', parent: '/knowledge' },
```

### Legacy Route Redirects

Document legacy routes that redirect:

```typescript
// In routes.ts
dashboard: {
  path: '/dashboard',
  label: 'Dashboard',
  // Note: Redirects to /systems in App.tsx
}

// In App.tsx
<Route path="/dashboard" element={<Navigate to="/systems" replace />} />
```

### Route Aliases

Create multiple paths to same route:

```typescript
// In App.tsx
<Route path="/home" element={<Navigate to="/" replace />} />
```

---

## Best Practices

### ✅ Do

- Define all routes in `routes.ts`
- Use route helper functions
- Set parent relationships for breadcrumbs
- Add descriptions for clarity
- Use TypeScript types

### ❌ Don't

- Hardcode paths in components
- Skip route definitions
- Forget parent relationships
- Mix route definitions across files

---

## Troubleshooting

### Route Not Found

**Problem**: Route doesn't work

**Solution**:
1. Check route is defined in `routes.ts`
2. Check route is added to `App.tsx`
3. Verify path matches exactly

### Breadcrumbs Not Working

**Problem**: Breadcrumbs don't show correctly

**Solution**:
1. Check parent relationship is set
2. Verify parent route exists
3. Check `buildBreadcrumbs()` function

### Type Errors

**Problem**: TypeScript errors with routes

**Solution**:
1. Use route helper functions
2. Import types from `config/routes`
3. Check route key exists in routes object

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System design
- [Best Practices](./BEST_PRACTICES.md) - Guidelines
- [Examples](./EXAMPLES.md) - Code examples

---

**Maintained By**: Frontend Engineering Team  
**Review Cycle**: Quarterly





