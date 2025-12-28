# Engineer Tasks - Navigation Refactor Phase

**Phase:** Post-Refactor Bug Fixes & Improvements  
**Priority:** Based on QA findings  
**Status:** Awaiting QA Results

## Task Categories

### P0 - Critical (Blocking)
*Must be fixed before release*

- [ ] **TASK-001**: [Title from QA findings]
  - **Description:** [Detailed description]
  - **Reproduction:** [Steps to reproduce]
  - **Expected:** [Expected behavior]
  - **Actual:** [Actual behavior]
  - **Files Affected:** [List of files]
  - **Estimated Time:** [Hours]
  - **Assignee:** [TBD]

### P1 - High Priority
*Should be fixed in this phase*

- [ ] **TASK-002**: [Title from QA findings]
  - **Description:** [Detailed description]
  - **Files Affected:** [List of files]
  - **Estimated Time:** [Hours]
  - **Assignee:** [TBD]

### P2 - Medium Priority
*Can be fixed in next phase*

- [ ] **TASK-003**: [Title from QA findings]
  - **Description:** [Detailed description]
  - **Files Affected:** [List of files]
  - **Estimated Time:** [Hours]
  - **Assignee:** [TBD]

### P3 - Low Priority
*Nice to have, can be backlogged*

- [ ] **TASK-004**: [Title from QA findings]
  - **Description:** [Detailed description]
  - **Files Affected:** [List of files]
  - **Estimated Time:** [Hours]
  - **Assignee:** [TBD]

## Common Fix Patterns

### Route Helper Issues
**Pattern:** Route helper returns incorrect path
**Fix Location:** `apps/frontend/src/config/routes.ts`
**Example:**
```typescript
// Verify route helpers
export const getMasterRoute = (domain: MasterDomain): string => {
  // Add validation
  if (!Object.values(MasterDomain).includes(domain)) {
    throw new Error(`Invalid domain: ${domain}`)
  }
  return `/master/${domain}`
}
```

### Breadcrumb Issues
**Pattern:** Breadcrumbs not building correctly
**Fix Location:** `apps/frontend/src/config/routes.ts` - `buildBreadcrumbs()`
**Check:**
- Route hierarchy in routes config
- Parent relationships
- Dynamic route matching

### Layout Issues
**Pattern:** Layout not wrapping correctly
**Fix Location:** `apps/frontend/src/App.tsx`
**Check:**
- All routes wrapped with Layout
- Conditional rendering logic
- Props passed correctly

### Type Safety Issues
**Pattern:** TypeScript errors with MasterDomain enum
**Fix Location:** `apps/frontend/src/types/index.ts`
**Check:**
- Enum values match route paths
- All usages use enum, not strings

## Testing After Fixes

For each fix:
1. [ ] Fix implemented
2. [ ] TypeScript compiles (`npm run type-check`)
3. [ ] Linter passes (`npm run lint`)
4. [ ] Manual test of fix
5. [ ] Smoke test passes
6. [ ] Code review completed
7. [ ] QA re-verification

## Task Template

```markdown
## TASK-XXX: [Title]

**Priority:** P0/P1/P2/P3  
**Status:** TODO/IN_PROGRESS/REVIEW/COMPLETE  
**Assignee:** [Name]  
**Created:** [Date]  
**Updated:** [Date]

### Description
[Detailed description of the issue]

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Error Details
```
[Error message/stack trace]
```

### Files to Modify
- `path/to/file1.ts`
- `path/to/file2.tsx`

### Proposed Solution
[Brief description of fix approach]

### Testing Checklist
- [ ] Fix implemented
- [ ] TypeScript compiles
- [ ] Manual test passes
- [ ] Smoke test passes
- [ ] QA verified

### Notes
[Any additional notes]
```

## Progress Tracking

### Week 1
- [ ] QA testing complete
- [ ] All issues documented
- [ ] Tasks created and prioritized
- [ ] Assignments made

### Week 2
- [ ] P0 issues fixed
- [ ] P1 issues in progress
- [ ] Re-testing started

### Week 3
- [ ] All P0/P1 issues fixed
- [ ] Final QA pass
- [ ] Documentation updated
- [ ] Phase complete

## Known Issues to Watch For

Based on implementation, these areas may need attention:

### 1. Dynamic Route Matching
**Potential Issue:** MasterDomainRouter may not handle invalid domains gracefully
**Files:** `apps/frontend/src/components/MasterDomainRouter.tsx`
**Check:** Error handling for unknown domains

### 2. Breadcrumb Building
**Potential Issue:** Dynamic routes may not build breadcrumbs correctly
**Files:** `apps/frontend/src/config/routes.ts` - `buildBreadcrumbs()`
**Check:** Regex matching for `/master/:domain` patterns

### 3. Product Route Parameters
**Potential Issue:** ProductDetailView may not receive productId correctly
**Files:** `apps/frontend/src/components/ProductDetailView.tsx`
**Check:** useParams hook usage with new route structure

### 4. Layout Conditional Rendering
**Potential Issue:** Layout may show/hide incorrectly on some pages
**Files:** `apps/frontend/src/components/Layout.tsx`
**Check:** showHeader and showBreadcrumbs props

### 5. Route Helper Type Safety
**Potential Issue:** String literals may be used instead of enum
**Files:** All components using routes
**Check:** All usages of `getMasterRoute()` and `getMasterProductRoute()`

