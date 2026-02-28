**Base:** `staging` (merge to staging after review)

## Summary
Refactors the Life-World-OS root ontology to a strict layout: REALITY as root with seven primary nodes (Constraints of Reality, Environments, Resources, Infrastructure, Agents, Value, Systems). Adds schema types (STATE, CAPABILITY, METRIC) and categories (INFORMATIONAL, TEMPORAL, ORGANIZATIONAL), updates seed and config, and wires the hierarchy tree and Master* pages to the new system node IDs. Adds tests and achieves ~90% frontend coverage (lines/statements); includes hierarchy Refresh and cache invalidation so the new ontology is visible after seed.

## Changes
- **Backend:** Prisma schema (RealityNodeType: STATE, CAPABILITY, METRIC; RealityNodeCategory: INFORMATIONAL, TEMPORAL, ORGANIZATIONAL). Seed: REALITY with seven primary nodes; Constraints (6 dimensions + Formalizations), Environments (6), Resources (6), Infrastructure (placeholder), Agents (5 types with States/Capabilities/Metrics), Value (7), Systems (7 flat with States + Universal Concepts). Energy states moved under Systems → Health → States. systemUniversalConceptConfig, systemLensData, resolveSystemLens, RealityNodeController, pathwayKnowledgeData updated for new IDs.
- **Frontend:** realityNodeDisplay (STATE/CAPABILITY/METRIC and category display/badges). Master* pages and useCacheWarming use new system universal-concept roots. HierarchyTreeView: Refresh button and cache invalidation; getTreeNodeType for new types. artifactSystemConfig and ChoosePlaneAssistant support new system nodes. financeApi and ArtifactsView aligned.
- **Config:** SYSTEM_UNIVERSAL_CONCEPT_MAP extended (career, production, governance, creation); ARTIFACT_SYSTEM_MAP with new system node IDs.
- **Docs:** REALITY_HIERARCHY.md rewritten; REALITY_TREE.md added (structured tree).
- **Tests:** HierarchyTreeView (ensureNode mock, node-flow metadata); artifactSystemConfig (flat system IDs); new realityNodeDisplay unit tests. Vitest coverage include + thresholds (90% lines/statements, 70% functions, 65% branches). E2E critical-flows updated for "Constraints of Reality" and new structure.

## Testing
- [x] Backend tests: `cd apps/backend && npm test`
- [x] Frontend tests: `cd apps/frontend && npm test`
- [x] Seed (if schema/seed changed): `cd apps/backend && npx prisma db push && npm run generate && npm run seed`

## Checklist
See [.github/PULL_REQUEST_CHECKLIST.md](.github/PULL_REQUEST_CHECKLIST.md) for full list. Confirm before requesting review:
- [x] Lint/type-check pass
- [x] Existing test coverage preserved or improved
- [x] No secrets or env-specific values in commits
- [x] Docs/README updated if user-facing or setup changed
