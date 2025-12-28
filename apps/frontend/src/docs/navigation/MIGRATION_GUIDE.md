# Navigation Migration Guide

**Status**: ✅ Active  
**Last Updated**: 2025-01-15

---

## Overview

This guide helps you fix navigation issues, migrate from direct `navigate()` calls to `useNavigation()` hook, and handle navigation changes after feature updates.

---

## Navigation Audit Checklist

### Route Definition Issues

- [ ] Routes defined in `App.tsx` but not in `routes.ts`
- [ ] Routes in `routes.ts` but not in `App.tsx`
- [ ] Duplicate route definitions
- [ ] Routes with wrong parent relationships
- [ ] Legacy routes that should be removed
- [ ] Routes missing metadata (icons, descriptions)

### Navigation Call Issues

- [ ] Direct `useNavigate()` calls (should use `useNavigation()`)
- [ ] Hardcoded paths (should use route helpers)
- [ ] Navigation to non-existent routes
- [ ] Navigation that breaks breadcrumb hierarchy
- [ ] Navigation that doesn't respect auth requirements

### Logical Flow Issues

- [ ] Navigation flows that don't make sense
- [ ] Missing navigation paths
- [ ] Circular navigation
- [ ] Dead-end routes
- [ ] Routes that should redirect but don't

---

## Systematic Fix Process

### Step 1: Audit Current State

#### Find All Navigation Calls

```bash
# Search for direct navigate() calls
grep -r "useNavigate\|navigate(" apps/frontend/src --include="*.tsx" --include="*.ts"
```

#### Check Route Definitions

1. List all routes in `App.tsx`
2. List all routes in `routes.ts`
3. Compare and identify mismatches

#### Identify Issues

Use the checklist above to categorize issues:
- Route definition problems
- Navigation call problems
- Logical flow problems
- Feature change impacts

### Step 2: Fix Route Definitions

#### Add Missing Routes to routes.ts

```typescript
// config/routes.ts
export const routes: Record<string, RouteConfig> = {
  // Add missing route
  myRoute: {
    path: '/my-route',
    label: 'My Route',
    parent: '/systems',
    requiresAuth: true,
  },
}
```

#### Update Parent Relationships

```typescript
// Fix parent relationship
myRoute: {
  path: '/my-route',
  parent: '/correct-parent',  // Fix this
}
```

#### Remove Legacy Routes

```typescript
// Mark as legacy in comments
// LEGACY: This route redirects to /systems
dashboard: {
  path: '/dashboard',
  // ...
}
```

### Step 3: Migrate Navigation Calls

#### Before: Direct useNavigate()

```typescript
// ❌ Don't do this
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate('/systems')  // Hardcoded path
  }
}
```

#### After: useNavigation() Hook

```typescript
// ✅ Do this
import { useNavigation } from '../hooks/useNavigation'
import { routes } from '../config/routes'

function MyComponent() {
  const { navigateTo } = useNavigation()
  
  const handleClick = () => {
    navigateTo(routes.systems.path)  // Use route config
  }
}
```

#### Using Route Helpers

```typescript
// ✅ Even better with helpers
import { getMasterRoute, MasterDomain } from '../config/routes'

const { navigateTo } = useNavigation()

navigateTo(getMasterRoute(MasterDomain.MONEY))
```

### Step 4: Fix Logical Flow Issues

#### Identify Broken Flows

1. **Missing Navigation Paths**
   - User can't get from A to B
   - Add navigation button/link

2. **Circular Navigation**
   - User gets stuck in loop
   - Add exit path or redirect

3. **Dead-End Routes**
   - No way to navigate away
   - Add back button or navigation

#### Example Fix

```typescript
// Before: Dead-end route
<Route path="/dead-end" element={<DeadEndPage />} />

// After: Add navigation
function DeadEndPage() {
  const { navigateTo, goBack } = useNavigation()
  
  return (
    <div>
      <button onClick={goBack}>Go Back</button>
      <button onClick={() => navigateTo('/home')}>Go Home</button>
    </div>
  )
}
```

### Step 5: Handle Feature Changes

#### When Routes Change After Feature Update

1. **Identify Changed Routes**
   - Old route path
   - New route path
   - Migration path

2. **Add Redirect**
   ```typescript
   // In App.tsx
   <Route path="/old-route" element={<Navigate to="/new-route" replace />} />
   ```

3. **Update Route Config**
   ```typescript
   // In routes.ts
   // LEGACY: Redirects to /new-route
   oldRoute: {
     path: '/old-route',
     // ...
   }
   ```

4. **Update Navigation Calls**
   - Find all references to old route
   - Update to new route
   - Test navigation flow

---

## Migration Examples

### Example 1: Migrate Direct navigate() Call

**Before:**
```typescript
import { useNavigate } from 'react-router-dom'

function ProductCard({ productId }) {
  const navigate = useNavigate()
  
  return (
    <button onClick={() => navigate(`/master/money/products/${productId}`)}>
      View Product
    </button>
  )
}
```

**After:**
```typescript
import { useNavigation } from '../hooks/useNavigation'
import { getMasterProductRoute, MasterDomain } from '../config/routes'

function ProductCard({ productId }) {
  const { navigateToMasterProduct } = useNavigation()
  
  return (
    <button onClick={() => 
      navigateToMasterProduct(MasterDomain.MONEY, productId)
    }>
      View Product
    </button>
  )
}
```

### Example 2: Fix Broken Breadcrumbs

**Problem**: Breadcrumbs don't show correctly

**Before:**
```typescript
// routes.ts
myRoute: {
  path: '/my-route',
  // Missing parent!
}
```

**After:**
```typescript
// routes.ts
myRoute: {
  path: '/my-route',
  parent: '/systems',  // Add parent
}
```

### Example 3: Handle Route Rename

**Scenario**: `/dashboard` renamed to `/systems`

**Step 1**: Add redirect
```typescript
// App.tsx
<Route path="/dashboard" element={<Navigate to="/systems" replace />} />
```

**Step 2**: Update route config
```typescript
// routes.ts
// LEGACY: Redirects to /systems
dashboard: {
  path: '/dashboard',
  // ...
}
```

**Step 3**: Update navigation calls
```typescript
// Find and replace
navigateTo('/dashboard')  // Old
navigateTo('/systems')    // New
```

---

## Testing After Migration

### Test Checklist

- [ ] All routes accessible
- [ ] Navigation works correctly
- [ ] Breadcrumbs show correctly
- [ ] No broken links
- [ ] Redirects work
- [ ] Type errors resolved

### Manual Testing

1. Navigate to each route
2. Check breadcrumbs
3. Test navigation buttons/links
4. Verify redirects
5. Test back button

### Automated Testing (Future)

```typescript
// Example test
describe('Navigation', () => {
  it('should navigate to route', () => {
    const { navigateTo } = useNavigation()
    navigateTo('/systems')
    expect(window.location.pathname).toBe('/systems')
  })
})
```

---

## Common Issues & Solutions

### Issue: Route Not Found

**Symptoms**: 404 error, route doesn't work

**Solution**:
1. Check route exists in `routes.ts`
2. Check route added to `App.tsx`
3. Verify path matches exactly

### Issue: Breadcrumbs Missing

**Symptoms**: Breadcrumbs don't show or incomplete

**Solution**:
1. Check parent relationship set
2. Verify parent route exists
3. Check `buildBreadcrumbs()` function

### Issue: Type Errors

**Symptoms**: TypeScript errors

**Solution**:
1. Use route helper functions
2. Import types correctly
3. Check route key exists

### Issue: Navigation Doesn't Work

**Symptoms**: Click doesn't navigate

**Solution**:
1. Check using `useNavigation()` hook
2. Verify route path is correct
3. Check for errors in console

---

## Related Documentation

- [Route Configuration](./ROUTE_CONFIGURATION.md) - How to define routes
- [Best Practices](./BEST_PRACTICES.md) - Guidelines
- [Examples](./EXAMPLES.md) - Code examples

---

**Maintained By**: Frontend Engineering Team  
**Review Cycle**: Quarterly


