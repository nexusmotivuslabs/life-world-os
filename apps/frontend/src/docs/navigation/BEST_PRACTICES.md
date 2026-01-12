# Navigation Best Practices

**Status**: ✅ Active  
**Last Updated**: 2025-01-15

---

## Core Principles

1. **Always use `useNavigation()` hook** - Never use `useNavigate()` directly
2. **Use route helpers** - Never hardcode paths
3. **Keep routes.ts as single source of truth** - All routes defined there
4. **Set parent relationships** - For breadcrumb generation
5. **Test navigation flows** - Verify all paths work

---

## Do's ✅

### Use useNavigation() Hook

```typescript
// ✅ DO: Use the hook
import { useNavigation } from '../hooks/useNavigation'

function MyComponent() {
  const { navigateTo, breadcrumbs } = useNavigation()
  
  return (
    <button onClick={() => navigateTo('/systems')}>
      Go to Systems
    </button>
  )
}
```

### Use Route Helpers

```typescript
// ✅ DO: Use route helpers
import { getMasterRoute, MasterDomain } from '../config/routes'

const { navigateTo } = useNavigation()
navigateTo(getMasterRoute(MasterDomain.MONEY))
```

### Define Routes in routes.ts

```typescript
// ✅ DO: Define in routes.ts
export const routes: Record<string, RouteConfig> = {
  myRoute: {
    path: '/my-route',
    label: 'My Route',
    parent: '/systems',
  },
}
```

### Set Parent Relationships

```typescript
// ✅ DO: Set parent for breadcrumbs
myRoute: {
  path: '/my-route',
  parent: '/systems',  // Enables breadcrumb generation
}
```

### Use Route Metadata

```typescript
// ✅ DO: Add metadata
myRoute: {
  path: '/my-route',
  label: 'My Route',
  icon: Settings,
  description: 'Route description',
  requiresAuth: true,
}
```

---

## Don'ts ❌

### Don't Use useNavigate() Directly

```typescript
// ❌ DON'T: Use useNavigate directly
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()
  navigate('/systems')  // Wrong!
}
```

### Don't Hardcode Paths

```typescript
// ❌ DON'T: Hardcode paths
navigateTo('/master/money/products/123')  // Wrong!

// ✅ DO: Use helpers
navigateToMasterProduct(MasterDomain.MONEY, '123')
```

### Don't Define Routes in Components

```typescript
// ❌ DON'T: Define routes in components
function MyComponent() {
  const path = '/my-route'  // Wrong!
}
```

### Don't Skip Parent Relationships

```typescript
// ❌ DON'T: Skip parent
myRoute: {
  path: '/my-route',
  // Missing parent - breadcrumbs won't work!
}
```

### Don't Mix Route Definitions

```typescript
// ❌ DON'T: Define routes in multiple places
// routes.ts
export const routes = { myRoute: { path: '/my-route' } }

// SomeComponent.tsx
const myRoute = '/my-route'  // Wrong! Duplicate definition
```

---

## Navigation Patterns

### Pattern 1: Simple Navigation

```typescript
// ✅ Good
const { navigateTo } = useNavigation()

<button onClick={() => navigateTo('/systems')}>
  Go to Systems
</button>
```

### Pattern 2: Navigation with Route Helper

```typescript
// ✅ Better
import { getMasterRoute, MasterDomain } from '../config/routes'

const { navigateTo } = useNavigation()

<button onClick={() => navigateTo(getMasterRoute(MasterDomain.MONEY))}>
  Go to Money
</button>
```

### Pattern 3: Navigation with Hook Method

```typescript
// ✅ Best
const { navigateToMaster } = useNavigation()

<button onClick={() => navigateToMaster(MasterDomain.MONEY)}>
  Go to Money
</button>
```

### Pattern 4: Navigation with Parameters

```typescript
// ✅ Good
const { navigateToMasterProduct } = useNavigation()

<button onClick={() => 
  navigateToMasterProduct(MasterDomain.MONEY, productId)
}>
  View Product
</button>
```

---

## Route Definition Patterns

### Pattern 1: Simple Route

```typescript
// ✅ Good
home: {
  path: '/',
  label: 'Home',
  requiresAuth: false,
}
```

### Pattern 2: Route with Parent

```typescript
// ✅ Good
knowledge: {
  path: '/knowledge',
  label: 'Knowledge Plane',
  parent: '/choose-plane',
  requiresAuth: true,
}
```

### Pattern 3: Route with Metadata

```typescript
// ✅ Good
knowledge: {
  path: '/knowledge',
  label: 'Knowledge Plane',
  parent: '/choose-plane',
  icon: BookOpen,
  requiresAuth: true,
  description: 'Read-only, interpretive systems',
}
```

### Pattern 4: Dynamic Route with Helper

```typescript
// ✅ Good
// Route definition
masterMoney: {
  path: getMasterRoute(MasterDomain.MONEY),
  label: 'Money',
  parent: '/explore',
}

// Helper function
export const getMasterRoute = (domain: MasterDomain): string => 
  `/master/${domain}`
```

---

## Component Patterns

### Pattern 1: Navigation Button

```typescript
// ✅ Good
function NavigationButton() {
  const { navigateTo } = useNavigation()
  
  return (
    <button onClick={() => navigateTo('/systems')}>
      Go to Systems
    </button>
  )
}
```

### Pattern 2: Navigation Link

```typescript
// ✅ Good
import { Link } from 'react-router-dom'
import { routes } from '../config/routes'

function NavigationLink() {
  return (
    <Link to={routes.systems.path}>
      Go to Systems
    </Link>
  )
}
```

### Pattern 3: Conditional Navigation

```typescript
// ✅ Good
function ConditionalNavigation({ isAuthenticated }) {
  const { navigateTo } = useNavigation()
  
  const handleClick = () => {
    if (isAuthenticated) {
      navigateTo('/systems')
    } else {
      navigateTo('/login')
    }
  }
  
  return <button onClick={handleClick}>Navigate</button>
}
```

### Pattern 4: Navigation with State

```typescript
// ✅ Good
function NavigationWithState() {
  const { navigateTo } = useNavigation()
  
  const handleClick = () => {
    navigateTo('/systems', { 
      state: { from: 'home' } 
    })
  }
  
  return <button onClick={handleClick}>Navigate</button>
}
```

---

## Testing Best Practices

### Test Navigation Flows

```typescript
// ✅ Test navigation
it('should navigate to route', () => {
  const { navigateTo } = useNavigation()
  navigateTo('/systems')
  expect(window.location.pathname).toBe('/systems')
})
```

### Test Breadcrumbs

```typescript
// ✅ Test breadcrumbs
it('should generate correct breadcrumbs', () => {
  const { breadcrumbs } = useNavigation()
  expect(breadcrumbs).toHaveLength(3)
  expect(breadcrumbs[0].path).toBe('/')
})
```

### Test Route Helpers

```typescript
// ✅ Test route helpers
it('should generate correct route', () => {
  const route = getMasterRoute(MasterDomain.MONEY)
  expect(route).toBe('/master/money')
})
```

---

## Common Mistakes

### Mistake 1: Direct useNavigate()

```typescript
// ❌ Wrong
const navigate = useNavigate()
navigate('/systems')

// ✅ Right
const { navigateTo } = useNavigation()
navigateTo('/systems')
```

### Mistake 2: Hardcoded Paths

```typescript
// ❌ Wrong
navigateTo('/master/money/products/123')

// ✅ Right
navigateToMasterProduct(MasterDomain.MONEY, '123')
```

### Mistake 3: Missing Parent

```typescript
// ❌ Wrong
myRoute: {
  path: '/my-route',
  // Missing parent
}

// ✅ Right
myRoute: {
  path: '/my-route',
  parent: '/systems',
}
```

### Mistake 4: Route Not in routes.ts

```typescript
// ❌ Wrong: Route only in App.tsx
<Route path="/my-route" element={<MyPage />} />

// ✅ Right: Also in routes.ts
// routes.ts
myRoute: { path: '/my-route', ... }

// App.tsx
<Route path="/my-route" element={<MyPage />} />
```

---

## Related Documentation

- [Route Configuration](./ROUTE_CONFIGURATION.md) - How to define routes
- [Migration Guide](./MIGRATION_GUIDE.md) - Fixing issues
- [Examples](./EXAMPLES.md) - Code examples

---

**Maintained By**: Frontend Engineering Team  
**Review Cycle**: Quarterly





