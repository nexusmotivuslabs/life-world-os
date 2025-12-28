# Navigation Architecture & Patterns

**Status**: ✅ Active  
**Last Updated**: 2025-01-15  
**Applies To**: All React frontend applications  
**Pattern**: React Router v6 + Zustand + Centralized Route Configuration

---

## Overview

This navigation system provides a **reusable, maintainable, and scalable** navigation architecture for React applications. It combines:

- **React Router v6**: Industry-standard routing library
- **Zustand**: Lightweight state management
- **Centralized Route Configuration**: Single source of truth for routes

This pattern is the **standard model for all engineering** and should be replicated across projects.

---

## Quick Links

- [Architecture](./ARCHITECTURE.md) - System design and structure
- [Patterns](./PATTERNS.md) - React Router + Zustand pattern details
- [Route Configuration](./ROUTE_CONFIGURATION.md) - How to define routes
- [Migration Guide](./MIGRATION_GUIDE.md) - Fixing navigation issues
- [Best Practices](./BEST_PRACTICES.md) - Do's and don'ts
- [Examples](./EXAMPLES.md) - Code examples

---

## Core Principles

1. **Single Source of Truth**: All routes defined in `config/routes.ts`
2. **Consistent API**: Always use `useNavigation()` hook
3. **Type Safety**: Full TypeScript support
4. **State Management**: Navigation state in Zustand store (future enhancement)
5. **Reusable Pattern**: Architecture can be extracted as template

---

## When to Use This Pattern

✅ **Use this pattern when:**
- Building new React applications
- Refactoring existing navigation
- Need consistent navigation across app
- Want navigation analytics/history (future)
- Need programmatic navigation control (future)

❌ **Don't use when:**
- Simple static site (no routing needed)
- Using Next.js (has built-in routing)
- Using Remix (has built-in routing)

---

## Getting Started

1. **Read Architecture**: Understand the system design
2. **Review Patterns**: Learn the React Router + Zustand pattern
3. **Follow Examples**: See real-world implementations
4. **Apply Best Practices**: Follow the guidelines

---

## Current Implementation

### Files Structure

```
apps/frontend/src/
├── config/
│   └── routes.ts              # Centralized route configuration
├── hooks/
│   └── useNavigation.ts       # Navigation hook (primary API)
├── services/
│   └── navigationService.ts   # Navigation hierarchy service
├── components/
│   ├── Layout.tsx             # Layout wrapper
│   ├── Header.tsx             # Header with navigation
│   └── Breadcrumbs.tsx        # Breadcrumb navigation
└── App.tsx                    # Route definitions
```

### Key Components

- **`config/routes.ts`**: Single source of truth for all routes
- **`hooks/useNavigation()`**: Primary navigation API
- **`components/Breadcrumbs`**: Automatic breadcrumb generation
- **`App.tsx`**: React Router route definitions

---

## Related Documentation

- [Data Loading Principle](../DATA_LOADING_PRINCIPLE.md) - How pages load data
- [Navigation Assessment](../../../../NAVIGATION_ASSESSMENT.md) - Current state assessment

---

**Maintained By**: Frontend Engineering Team  
**Review Cycle**: Quarterly


