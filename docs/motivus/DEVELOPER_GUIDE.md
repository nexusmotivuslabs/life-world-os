# Life World OS Developer Guide

## Team: Motivus
## Company: motivus_labs

## Navigation Framework

### Hierarchical Ontology

Navigation follows a strict hierarchical structure:
- **Home** (root)
- **System Tiers** (tier overview)
- **System** (e.g., Money, Energy)
- **Sub-System** (e.g., Products, Agents)

### Current Node Tracking

The app tracks the current navigation node:
- Breadcrumbs reflect the current path
- Navigation state is maintained across routes
- Each node knows its parent and children

### Adding New Routes

1. Define route in `config/routes.ts`
2. Add route to `App.tsx`
3. Update breadcrumb logic if needed
4. Ensure parent-child relationships are correct

## Choose Plane Assistant

The Choose Plane is a **silent assistant** that:
- Provides contextual guidance
- Combines local + root knowledge for verification
- Appears contextually, not as mandatory entry
- Acts as verification layer

### Implementation

The assistant uses:
- Local knowledge (app database)
- Root knowledge (external APIs)
- Combined verification logic

## Verification Framework

See `VERIFICATION_FRAMEWORK.md` for details.

### Integration Points

When integrating external APIs:
1. Document the API endpoint
2. Define verification logic
3. Add to verification framework
4. Update knowledge guides

## Data Loading Principle

**Always load data before rendering pages.**

Use the `usePageDataLoader` hook or create a loader component:
- Loads data before page renders
- Shows loading state during fetch
- Passes preloaded data to page component

See `DATA_LOADING_PRINCIPLE.md` for details.

## Code Organization

- **Components**: Reusable UI components
- **Pages**: Full page components
- **Services**: API clients
- **Hooks**: Reusable React hooks
- **Types**: TypeScript type definitions
- **Docs**: Documentation (this directory)

## Git Workflow

- Company: `motivus_labs`
- Team: `Motivus`
- Follow standard git flow
- Document breaking changes
- Update guides when adding features





