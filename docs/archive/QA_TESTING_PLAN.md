# QA Testing Plan - Navigation Refactor Phase

**Phase:** Post-Navigation Refactor Testing  
**Date:** Current  
**Status:** Active Testing Phase

## Overview

This document outlines the comprehensive testing plan for the navigation refactor that implemented:
- Route abstraction to `/master/{domain}` pattern
- Centralized route configuration
- Breadcrumb navigation system
- Shared Layout component
- Type-safe navigation with enums

## Testing Scope

### Critical Areas
1. **Navigation & Routing**
   - Route transitions
   - Breadcrumb functionality
   - Back navigation
   - Deep linking

2. **Component Integration**
   - Layout wrapper
   - Master domain router
   - Route helpers

3. **Error Handling**
   - Invalid routes
   - Missing components
   - API failures during navigation

4. **User Experience**
   - Navigation flow
   - Visual consistency
   - Performance

## Test Categories

### 1. Smoke Tests (Priority: Critical)
**Duration:** 15 minutes  
**Frequency:** After each deployment

#### Navigation Smoke Tests
- [ ] App loads at `/` and redirects to `/explore`
- [ ] All master routes accessible: `/master/money`, `/master/energy`, `/master/travel`
- [ ] Product routes work: `/master/money/products/:productId`
- [ ] Breadcrumbs appear on all authenticated pages
- [ ] Layout header visible on all pages
- [ ] No console errors on initial load

#### Quick Verification Checklist
```bash
# Run these commands to verify:
curl http://localhost:5173
curl http://localhost:5173/explore
curl http://localhost:5173/master/money
curl http://localhost:5173/master/energy
curl http://localhost:5173/master/travel
```

### 2. Functional Tests (Priority: High)
**Duration:** 2-3 hours  
**Frequency:** Before each release

#### Route Navigation Tests
- [ ] Navigate from Explore Systems to each master domain
- [ ] Navigate from Dashboard to master domains
- [ ] Navigate from master domain to products
- [ ] Navigate back using breadcrumbs
- [ ] Direct URL access works (deep linking)
- [ ] Browser back/forward buttons work
- [ ] Refresh page maintains route state

#### Breadcrumb Tests
- [ ] Breadcrumbs show correct hierarchy
- [ ] Breadcrumb links are clickable
- [ ] Current page highlighted in breadcrumbs
- [ ] Breadcrumbs update on navigation
- [ ] Breadcrumbs hidden on login/register pages

#### Layout Tests
- [ ] Header appears on authenticated pages
- [ ] Header hidden on login/register (if configured)
- [ ] Logout button works
- [ ] "Explore Systems" link in header works
- [ ] "Admin" link in header works
- [ ] User welcome message displays correctly

### 3. Integration Tests (Priority: High)
**Duration:** 3-4 hours  
**Frequency:** Weekly

#### Component Integration
- [ ] MasterDomainRouter routes correctly for all domains
- [ ] ProductDetailView receives correct productId from route
- [ ] All components using route helpers work correctly
- [ ] ExploreSystems navigation to master routes works
- [ ] Dashboard links to master routes work
- [ ] Card components (MasterMoneyCard, MasterEnergyCard) navigate correctly

#### API Integration During Navigation
- [ ] Data loads correctly when navigating to master domains
- [ ] Loading states display during navigation
- [ ] Error states handle API failures gracefully
- [ ] No duplicate API calls on navigation

### 4. Error Handling Tests (Priority: Medium)
**Duration:** 2 hours  
**Frequency:** Before releases

#### Invalid Route Tests
- [ ] Invalid domain in `/master/:domain` shows error page
- [ ] Invalid productId shows error page
- [ ] 404 page for unknown routes
- [ ] Error boundaries catch component errors

#### Network Error Tests
- [ ] Navigation works when API is down
- [ ] Error messages display correctly
- [ ] User can navigate away from error states
- [ ] No infinite loading states

### 5. Performance Tests (Priority: Medium)
**Duration:** 1 hour  
**Frequency:** Monthly

#### Navigation Performance
- [ ] Route transitions < 100ms
- [ ] No layout shift during navigation
- [ ] Breadcrumbs render quickly
- [ ] No memory leaks during navigation

### 6. Cross-Browser Tests (Priority: High)
**Duration:** 2 hours  
**Frequency:** Before major releases

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 7. Accessibility Tests (Priority: Medium)
**Duration:** 1 hour  
**Frequency:** Before releases

#### A11y Checks
- [ ] Breadcrumbs have proper ARIA labels
- [ ] Navigation links keyboard accessible
- [ ] Focus management during navigation
- [ ] Screen reader announces route changes

## Error Monitoring Checklist

### Console Error Monitoring
**Location:** Browser DevTools Console  
**Frequency:** Continuous during testing

#### Critical Errors to Watch For
- [ ] No `404` errors for route assets
- [ ] No `TypeError` in route helpers
- [ ] No `Cannot read property` errors
- [ ] No React hydration errors
- [ ] No router errors

#### Warning Monitoring
- [ ] Unused variable warnings (non-blocking)
- [ ] Deprecation warnings
- [ ] React key warnings

### Network Error Monitoring
**Location:** Browser DevTools Network Tab  
**Frequency:** During navigation tests

#### API Error Patterns
- [ ] Failed API calls during navigation
- [ ] CORS errors
- [ ] Timeout errors
- [ ] 500 errors from backend

### Runtime Error Monitoring
**Location:** Application UI + Console  
**Frequency:** Continuous

#### User-Visible Errors
- [ ] Error toasts display correctly
- [ ] Error boundaries catch errors
- [ ] Loading states don't hang
- [ ] No blank white screens

## Test Execution Log

### Test Run Template
```
Date: [DATE]
Tester: [NAME]
Environment: [LOCAL/STAGING/PRODUCTION]
Build: [VERSION/COMMIT]

Results:
- Smoke Tests: [PASS/FAIL] - [NOTES]
- Functional Tests: [PASS/FAIL] - [NOTES]
- Integration Tests: [PASS/FAIL] - [NOTES]
- Error Handling: [PASS/FAIL] - [NOTES]

Critical Issues Found: [LIST]
Blockers: [YES/NO]
```

## Error Reporting Template

When reporting errors, include:

1. **Error Details**
   - Error message
   - Stack trace
   - Console logs
   - Network requests

2. **Reproduction Steps**
   - Step-by-step instructions
   - Expected vs actual behavior
   - Screenshots/videos

3. **Environment**
   - Browser and version
   - OS
   - URL where error occurred
   - User actions before error

4. **Severity**
   - Critical: Blocks core functionality
   - High: Major feature broken
   - Medium: Minor feature issue
   - Low: Cosmetic issue

## Sign-off Criteria

Before marking testing complete:
- [ ] All smoke tests pass
- [ ] All critical functional tests pass
- [ ] No console errors in production build
- [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Accessibility checks pass

## Next Steps After Testing

1. Document all found issues
2. Prioritize fixes
3. Create engineering tasks
4. Schedule fix implementation
5. Re-test after fixes

