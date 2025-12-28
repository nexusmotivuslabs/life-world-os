# Testing Guide

**Last Updated**: 2025-01-15  
**Maintained By**: Sentinel (QA Engineer)

---

## Overview

This guide covers testing strategies, test commands, and QA procedures for Life World OS.

---

## Quick Test Commands

### Run All Tests
```bash
# Backend tests
cd apps/backend
npm test

# Frontend tests
cd apps/frontend
npm test
```

### Test Coverage
```bash
# Backend coverage
cd apps/backend
npm run test:coverage

# Frontend coverage
cd apps/frontend
npm run test:coverage
```

### E2E Tests
```bash
# Run Playwright tests
cd apps/frontend
npm run test:e2e
```

---

## Testing Strategy

### Unit Tests
- Target: 70%+ coverage
- Focus: Business logic, utilities, services
- Framework: Vitest (backend), Vitest + React Testing Library (frontend)

### Integration Tests
- Focus: API endpoints, database interactions
- Framework: Vitest with test database

### E2E Tests
- Focus: Critical user flows
- Framework: Playwright
- Coverage: Authentication, core features

---

## Test Structure

```
apps/backend/
├── src/
│   └── __tests__/        # Unit tests
│   └── __integration__/  # Integration tests
└── tests/                # E2E tests

apps/frontend/
├── src/
│   └── __tests__/        # Unit tests
└── e2e/                  # E2E tests
```

---

## QA Checklist

### Pre-Release Testing
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Test coverage meets target (70%+)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Accessibility checks
- [ ] Performance testing

### Manual Testing
- [ ] Navigation flows
- [ ] Authentication flow
- [ ] API connectivity
- [ ] Error handling
- [ ] Form validation
- [ ] Data persistence

---

## Error Monitoring

### Development
- Errors logged to console
- Use browser DevTools
- Check backend logs

### Production
- Use observability dashboard
- Monitor error rates
- Set up alerts

---

## Test Data

### Seed Data
```bash
# Seed development database
cd apps/backend
npm run seed
```

### Test Users
- Test accounts created during seeding
- See `apps/backend/prisma/seed.ts` for details

---

## Continuous Integration

### CI Pipeline
- Runs on every push
- Runs all test suites
- Checks coverage
- Blocks merge if tests fail

### Pre-commit Hooks
- Linting
- Type checking
- Quick test suite

---

## Performance Testing

### Load Testing
```bash
# Use tools like:
# - Apache Bench (ab)
# - k6
# - Artillery
```

### Metrics to Monitor
- Response times
- Throughput
- Error rates
- Resource usage

---

## Accessibility Testing

### Tools
- WAVE (browser extension)
- axe DevTools
- Lighthouse
- Screen readers

### Standards
- WCAG AA compliance
- Keyboard navigation
- Screen reader compatibility

---

## Related Documents

- [Development Guide](../README.md#manual-setup-alternative)
- [API Documentation](./API_DOCUMENTATION.md)
- [Runbooks](./RUNBOOKS.md)

---

**Maintained By**: Sentinel (QA Engineer)  
**Review Cycle**: Before each release


