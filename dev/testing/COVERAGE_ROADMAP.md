# Coverage Roadmap – Target 85%

**Goal:** 85% line, function, branch, and statement coverage across backend and frontend to ensure app reliability.

**Current status:** ~4% statements/lines. Thresholds are set to current baselines so CI passes; raise them as coverage increases.

## Commands

```bash
# Backend
cd apps/backend && npm run test:coverage

# Frontend
cd apps/frontend && npm run test:coverage

# Both
npm run test:coverage
```

## To Reach 85%

### Backend – Priority Order

1. **Services (pure logic):** decayService, burnoutService, policyChecker, tickService, decisionEngine
2. **Utils:** problemDetails ✅, validation helpers
3. **Config:** systemUniversalConceptConfig, systemTeamAgentConfig
4. **Routes:** auth ✅, loadouts ✅, dashboard ✅ – extend with more edge cases
5. **Domains:** Controllers and use cases – mock Prisma/ports

### Frontend – Priority Order

1. **Utils:** currency ✅, enumDisplayNames ✅, realityNodeDisplay
2. **Config:** artifactSystemConfig ✅
3. **Services:** api.ts, blogApi ✅ – mock fetch for financeApi, travelApi, etc.
4. **Store:** useNavigationStore ✅, useGameStore, useToastStore
5. **Components:** Start with small ones (Breadcrumbs, CloudGauge), then larger (ArtifactsView)

### Exclusions (Not Counted Toward 85%)

- Seed scripts, data files (`**/scripts/seed*.ts`, `**/*Data.ts`)
- Entry points (`index.ts`, `main.tsx`, `App.tsx`)
- Config files (`**/*.config.*`)

## Threshold Updates

When coverage reaches a new milestone, update `vitest.config.ts` in each app:

```ts
thresholds: {
  lines: 85,
  functions: 85,
  branches: 85,
  statements: 85,
},
```

Run `npm run test:coverage` before merging to confirm thresholds pass.
