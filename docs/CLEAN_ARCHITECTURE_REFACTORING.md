# Clean Architecture Refactoring Plan

**Purpose**: Refactor codebase to follow clean architecture principles  
**Target**: V1.1.0 Release  
**Status**: Planning

---

## Principles

### Clean Architecture Layers

1. **Presentation Layer** (Controllers, Routes, UI Components)
   - Handles HTTP requests/responses
   - Input validation
   - Output formatting
   - No business logic

2. **Application Layer** (Use Cases, Services)
   - Business logic
   - Orchestrates domain objects
   - Transaction management
   - Application-specific rules

3. **Domain Layer** (Entities, Value Objects, Domain Services)
   - Core business logic
   - Domain rules
   - No dependencies on other layers
   - Pure business logic

4. **Infrastructure Layer** (Repositories, External Services, Database)
   - Data persistence
   - External API calls
   - Framework-specific code
   - Implements domain interfaces

---

## Backend Refactoring

### Current Structure Analysis

**Issues**:
- Mixed concerns in controllers
- Business logic in routes
- Direct database access in services
- Tight coupling

**Target Structure**:
```
apps/backend/src/
├── domains/              # Domain layer
│   ├── money/
│   │   ├── domain/       # Entities, value objects
│   │   ├── application/ # Use cases
│   │   └── infrastructure/ # Adapters
│   └── energy/
├── shared/               # Shared domain logic
├── presentation/         # Controllers, routes
└── infrastructure/       # Database, external services
```

### Refactoring Steps

1. **Extract Domain Entities**
   - Move business logic to domain entities
   - Create value objects
   - Define domain interfaces

2. **Create Use Cases**
   - Extract business logic from controllers
   - Create application services
   - Implement use case pattern

3. **Implement Repository Pattern**
   - Create repository interfaces (domain)
   - Implement repositories (infrastructure)
   - Use dependency injection

4. **Separate Presentation**
   - Controllers only handle HTTP
   - DTOs for input/output
   - Validation in presentation layer

---

## Frontend Refactoring

### Current Structure Analysis

**Issues**:
- Business logic in components
- Direct API calls in components
- Mixed concerns
- No service layer

**Target Structure**:
```
apps/frontend/src/
├── components/           # UI components (presentation)
├── services/            # API services (infrastructure)
├── hooks/               # Custom hooks (application)
├── stores/              # State management (application)
├── types/               # Type definitions (domain)
└── utils/               # Utilities (shared)
```

### Refactoring Steps

1. **Extract Service Layer**
   - Create API service classes
   - Abstract HTTP calls
   - Error handling in services

2. **Create Custom Hooks**
   - Extract business logic to hooks
   - Data fetching hooks
   - State management hooks

3. **Component Composition**
   - Small, focused components
   - Container/presenter pattern
   - Reusable components

4. **State Management**
   - Centralize state
   - Use Zustand stores
   - Separate UI state from business state

---

## Refactoring Checklist

### Backend
- [ ] Extract domain entities
- [ ] Create use cases
- [ ] Implement repository pattern
- [ ] Separate presentation layer
- [ ] Add dependency injection
- [ ] Remove business logic from controllers
- [ ] Create DTOs
- [ ] Add input validation

### Frontend
- [ ] Extract service layer
- [ ] Create custom hooks
- [ ] Separate components
- [ ] Centralize state management
- [ ] Remove business logic from components
- [ ] Create type definitions
- [ ] Add error boundaries

---

## Google Refactoring Principles

### Extract Method
- Break large methods into smaller ones
- Single responsibility
- Clear naming

### Extract Class
- Separate concerns into classes
- Single responsibility principle
- Clear boundaries

### Move Method
- Move methods to appropriate classes
- Reduce coupling
- Improve cohesion

### Remove Duplication
- DRY principle
- Extract common code
- Create utilities

---

## Implementation Priority

### Phase 1: Critical (Before Release)
1. Remove console.log statements
2. Remove TODO/FIXME comments
3. Fix security issues
4. Ensure test coverage

### Phase 2: Important (Before Release)
1. Extract service layer (frontend)
2. Separate presentation (backend)
3. Remove business logic from controllers
4. Add proper error handling

### Phase 3: Nice to Have (Post-Release)
1. Full clean architecture implementation
2. Complete repository pattern
3. Advanced dependency injection
4. Comprehensive refactoring

---

## Success Criteria

- ✅ No console.log in production code
- ✅ No TODO/FIXME comments
- ✅ 80%+ test coverage
- ✅ No security vulnerabilities
- ✅ Clean separation of concerns
- ✅ Proper error handling
- ✅ Type safety
- ✅ No code duplication

---

**Status**: Planning  
**Target Completion**: Before V1.1.0 Release

