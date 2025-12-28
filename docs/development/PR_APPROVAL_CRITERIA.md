# Pull Request Approval Criteria

**Status**: ✅ Active  
**Last Updated**: 2025-01-15  
**Applies To**: All Pull Requests

---

## Overview

This document defines the minimum requirements for PR approval. All PRs must meet these criteria before being merged.

---

## Mandatory Requirements

### 1. Code Testing

**Requirement**: Code must be tested at a minimum with:
- ✅ **Sunny path** (happy path) - Normal operation with valid inputs
- ✅ **Minimum 3 edge cases** - Error conditions, boundary cases, or unusual scenarios

**Examples of Edge Cases:**
- Empty/null inputs
- Invalid inputs
- Boundary values (min/max)
- Network failures
- Timeout scenarios
- Concurrent operations
- State transitions

**Verification:**
- [ ] Sunny path test passes
- [ ] At least 3 edge case tests pass
- [ ] All tests are documented
- [ ] Test coverage is adequate

### 2. Build Verification

**Requirement**: Code must build locally with no errors

**Verification:**
- [ ] `npm run build` (or equivalent) succeeds
- [ ] `npm run type-check` (or equivalent) passes
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] No compilation warnings (unless explicitly documented)

**Commands to Run:**
```bash
# Frontend
cd apps/frontend
npm run build
npm run type-check
npm run lint

# Backend
cd apps/backend
npm run build  # or equivalent
npm run type-check  # or equivalent
npm run lint
```

---

## Additional Requirements

### Code Quality

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] No console.logs or debug code left in
- [ ] No hardcoded values (use constants/config)

### Testing

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Tests cover edge cases (minimum 3)
- [ ] Manual testing completed
- [ ] Integration tests updated (if applicable)

### Documentation

- [ ] README updated (if needed)
- [ ] Code comments added/updated
- [ ] User-facing documentation updated (if needed)
- [ ] Developer documentation updated (if needed)
- [ ] API documentation updated (if applicable)

### Security & Accessibility

- [ ] Security considerations reviewed
- [ ] Input validation implemented
- [ ] XSS prevention verified
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Keyboard navigation works
- [ ] Screen reader tested (if applicable)

### Performance

- [ ] No performance regressions
- [ ] Bundle size impact considered
- [ ] Lazy loading implemented (if applicable)

### CI/CD

- [ ] CI pipeline passes
- [ ] Build succeeds
- [ ] No linting errors
- [ ] No type errors
- [ ] Security scans pass

---

## PR Checklist Template

Copy this checklist into your PR:

```markdown
## PR Requirements Checklist

### Mandatory Requirements
- [ ] Code tested with sunny path
- [ ] Code tested with minimum 3 edge cases
- [ ] Code builds locally with no errors
- [ ] TypeScript type-check passes
- [ ] Linting passes

### Code Quality
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] No console.logs or debug code left in
- [ ] No hardcoded values

### Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Tests cover edge cases (minimum 3)
- [ ] Manual testing completed

### Documentation
- [ ] README updated (if needed)
- [ ] Code comments added/updated
- [ ] Developer documentation updated (if needed)

### Security & Accessibility
- [ ] Security considerations reviewed
- [ ] Input validation implemented
- [ ] Accessibility requirements met

### Performance
- [ ] No performance regressions
- [ ] Bundle size impact considered

### CI/CD
- [ ] CI pipeline passes
- [ ] Build succeeds
- [ ] No linting errors
- [ ] No type errors
```

---

## Testing Requirements Details

### Sunny Path Testing

**Definition**: Test the normal, expected flow with valid inputs.

**Example:**
```typescript
// Sunny path test
it('should navigate to route successfully', () => {
  const { navigateTo } = useNavigation()
  navigateTo('/systems')
  expect(window.location.pathname).toBe('/systems')
})
```

### Edge Case Testing (Minimum 3)

**Definition**: Test error conditions, boundary cases, or unusual scenarios.

**Examples:**
```typescript
// Edge case 1: Invalid route
it('should handle invalid route gracefully', () => {
  const { navigateTo } = useNavigation()
  expect(() => navigateTo('/invalid-route')).not.toThrow()
})

// Edge case 2: Empty/null input
it('should handle empty path', () => {
  const { navigateTo } = useNavigation()
  expect(() => navigateTo('')).not.toThrow()
})

// Edge case 3: Network failure
it('should handle navigation failure', async () => {
  // Mock network failure
  // Test error handling
})
```

---

## Build Verification Details

### Frontend Build

```bash
cd apps/frontend
npm install
npm run build
npm run type-check
npm run lint
```

**Expected Results:**
- Build completes without errors
- No TypeScript errors
- No linting errors
- Bundle size is reasonable

### Backend Build

```bash
cd apps/backend
npm install  # or equivalent
npm run build  # or equivalent
npm run type-check  # or equivalent
npm run lint
```

**Expected Results:**
- Build completes without errors
- No TypeScript/compilation errors
- No linting errors

---

## Approval Process

### Before Requesting Review

1. ✅ Complete all mandatory requirements
2. ✅ Run all tests locally
3. ✅ Verify build succeeds
4. ✅ Complete PR checklist
5. ✅ Self-review completed

### Reviewer Checklist

Reviewers should verify:

- [ ] Mandatory requirements met
- [ ] Code quality acceptable
- [ ] Tests are adequate
- [ ] Documentation is complete
- [ ] Security considerations addressed
- [ ] No breaking changes (or breaking changes are documented)

### Approval Criteria

**PR can be approved when:**
- ✅ All mandatory requirements met
- ✅ All tests pass
- ✅ Build succeeds
- ✅ Code review completed
- ✅ No blocking issues

**PR should be rejected if:**
- ❌ Mandatory requirements not met
- ❌ Tests fail
- ❌ Build fails
- ❌ Security issues found
- ❌ Breaking changes not documented

---

## Exceptions

### Documentation-Only PRs

For documentation-only PRs:
- Testing requirements may be waived
- Build verification still required
- Documentation review required

### Emergency Fixes

For emergency/hotfix PRs:
- Minimum testing required (sunny path + 1 edge case)
- Build verification required
- Full testing can be added in follow-up PR

---

## Related Documentation

- [Navigation Documentation](../../apps/frontend/src/docs/navigation/README.md)
- [Data Loading Principle](../../apps/frontend/src/docs/DATA_LOADING_PRINCIPLE.md)

---

**Maintained By**: Engineering Team  
**Review Cycle**: Quarterly


