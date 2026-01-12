# Navigation Audit Checklist

**Status**: ✅ Active  
**Last Updated**: 2025-01-15

---

## Purpose

Use this checklist to systematically audit and fix navigation issues in the application.

---

## Route Definition Audit

### Checklist

- [ ] All routes in `App.tsx` are defined in `routes.ts`
- [ ] All routes in `routes.ts` are used in `App.tsx`
- [ ] No duplicate route definitions
- [ ] All routes have correct parent relationships
- [ ] Legacy routes are documented
- [ ] Routes have appropriate metadata (icons, descriptions)
- [ ] Dynamic routes have helper functions
- [ ] Route paths match exactly between `App.tsx` and `routes.ts`

### How to Check

1. **List routes in App.tsx:**
   ```bash
   grep -E "path=\"|path=\'" apps/frontend/src/App.tsx
   ```

2. **List routes in routes.ts:**
   ```bash
   grep -E "path:" apps/frontend/src/config/routes.ts
   ```

3. **Compare lists** and identify mismatches

### Fix Process

1. Add missing routes to `routes.ts`
2. Remove unused routes
3. Fix parent relationships
4. Add metadata
5. Create helper functions for dynamic routes

---

## Navigation Call Audit

### Checklist

- [ ] No direct `useNavigate()` calls (should use `useNavigation()`)
- [ ] No hardcoded paths (should use route helpers)
- [ ] All navigation uses `useNavigation()` hook
- [ ] Route helpers are used for dynamic routes
- [ ] Navigation respects auth requirements
- [ ] Navigation doesn't break breadcrumb hierarchy

### How to Check

1. **Find direct useNavigate() calls:**
   ```bash
   grep -r "useNavigate\|navigate(" apps/frontend/src --include="*.tsx" --include="*.ts" | grep -v "useNavigation"
   ```

2. **Find hardcoded paths:**
   ```bash
   grep -r "navigateTo\('/\|navigate\('/" apps/frontend/src --include="*.tsx" --include="*.ts"
   ```

3. **Check for route helper usage:**
   ```bash
   grep -r "getMasterRoute\|getMasterProductRoute" apps/frontend/src --include="*.tsx" --include="*.ts"
   ```

### Fix Process

1. Replace `useNavigate()` with `useNavigation()`
2. Replace hardcoded paths with route helpers
3. Use hook helper methods when available
4. Test navigation after changes

---

## Logical Flow Audit

### Checklist

- [ ] All navigation flows make logical sense
- [ ] No missing navigation paths
- [ ] No circular navigation
- [ ] No dead-end routes
- [ ] Redirects work correctly
- [ ] Back button works correctly
- [ ] Breadcrumbs show correct path

### How to Check

1. **Manual Testing:**
   - Navigate through all routes
   - Check breadcrumbs
   - Test back button
   - Verify redirects

2. **Flow Analysis:**
   - Map all navigation paths
   - Identify missing connections
   - Find circular references
   - Locate dead ends

### Fix Process

1. Add missing navigation paths
2. Fix circular navigation
3. Add exit paths for dead ends
4. Update redirects
5. Test all flows

---

## Feature Change Impact Audit

### Checklist

- [ ] Routes updated after feature changes
- [ ] Old routes redirect to new routes
- [ ] Navigation calls updated
- [ ] Breadcrumbs updated
- [ ] Route metadata updated
- [ ] Tests updated

### How to Check

1. **Review recent feature changes:**
   - Check git history for route changes
   - Identify renamed/moved routes
   - Find deprecated routes

2. **Check redirects:**
   ```bash
   grep -r "Navigate to=" apps/frontend/src/App.tsx
   ```

3. **Find references to old routes:**
   ```bash
   grep -r "old-route-path" apps/frontend/src
   ```

### Fix Process

1. Add redirects for old routes
2. Update navigation calls
3. Update route definitions
4. Update breadcrumbs
5. Test migration path

---

## Type Safety Audit

### Checklist

- [ ] All route helpers are typed
- [ ] Navigation hook is typed
- [ ] Route config is typed
- [ ] No TypeScript errors
- [ ] Types are exported correctly

### How to Check

1. **Run TypeScript check:**
   ```bash
   cd apps/frontend && npm run type-check
   ```

2. **Check type exports:**
   ```bash
   grep -r "export.*RouteConfig\|export.*Navigation" apps/frontend/src
   ```

### Fix Process

1. Add missing types
2. Fix type errors
3. Export types correctly
4. Update type definitions

---

## Testing Audit

### Checklist

- [ ] All routes are accessible
- [ ] Navigation works correctly
- [ ] Breadcrumbs show correctly
- [ ] Redirects work
- [ ] Back button works
- [ ] No broken links
- [ ] No console errors

### How to Test

1. **Manual Testing:**
   - Navigate to each route
   - Check breadcrumbs
   - Test navigation buttons
   - Verify redirects
   - Test back button

2. **Automated Testing (Future):**
   ```typescript
   // Example test
   describe('Navigation', () => {
     it('should navigate to route', () => {
       // Test navigation
     })
   })
   ```

### Fix Process

1. Fix broken routes
2. Fix navigation issues
3. Fix breadcrumb issues
4. Fix redirects
5. Fix console errors

---

## Documentation Audit

### Checklist

- [ ] Routes are documented
- [ ] Navigation patterns are documented
- [ ] Examples are provided
- [ ] Migration guide is up to date
- [ ] Best practices are documented

### How to Check

1. **Check documentation:**
   ```bash
   ls -la apps/frontend/src/docs/navigation/
   ```

2. **Review documentation:**
   - Check examples
   - Verify accuracy
   - Check completeness

### Fix Process

1. Update documentation
2. Add missing examples
3. Update migration guide
4. Add best practices

---

## Quick Audit Script

### Run Full Audit

```bash
#!/bin/bash
# navigation-audit.sh

echo "=== Route Definition Audit ==="
echo "Routes in App.tsx:"
grep -E "path=\"|path=\'" apps/frontend/src/App.tsx | wc -l

echo "Routes in routes.ts:"
grep -E "path:" apps/frontend/src/config/routes.ts | wc -l

echo ""
echo "=== Navigation Call Audit ==="
echo "Direct useNavigate() calls:"
grep -r "useNavigate\|navigate(" apps/frontend/src --include="*.tsx" --include="*.ts" | grep -v "useNavigation" | wc -l

echo "Hardcoded paths:"
grep -r "navigateTo\('/\|navigate\('/" apps/frontend/src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "=== Type Safety Audit ==="
cd apps/frontend && npm run type-check
```

---

## Related Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - How to fix issues
- [Best Practices](./BEST_PRACTICES.md) - Guidelines
- [Examples](./EXAMPLES.md) - Code examples

---

**Maintained By**: Frontend Engineering Team  
**Review Cycle**: Quarterly





