## Summary
Skill Leverage Matrix is redesigned for clarity and full-screen use: skill names are visible on the chart (quadrant and spectrum), hover highlights the point, and click opens the full description. A single `SystemId` enum is used for system tracking across configs and pages. New tests cover chart labels, zone list, quadrant/spectrum views, and `onSkillClick` from list and spectrum.

## Changes
- **Skills Map Chart:** Full-screen layout (55vh chart, zone sidebar on lg); visible skill labels under each point (reference: ticker-under-stock); quadrant gradient and spectrum bar fill edge-to-edge; "Skills by impact zone" list (Focus here / Leverage / Compounding / Later); single-line tooltip; stronger hover (4px stroke, glow).
- **SystemId enum:** `types/index.ts` `SystemId`; `skillsMapConfig` and `artifactSystemConfig` use enum; Master* pages and Career* components pass `SystemId`; `getSkillsMapConfig('relationships')` maps to Trust.
- **Tests:** `SkillsMapChart.test.tsx` — 11 tests (title, quadrant labels, zone list, zone list click → `onSkillClick`, spectrum view and skill names, spectrum click → `onSkillClick`, Radio/Gamma labels). `SkillLeverageModal.test.tsx` and config tests unchanged; all 174 frontend tests pass.
- **CareerSystemDetail:** `CAREER_SYSTEM_IDS` as `as const` and `CareerDetailSystemId` type so `systemConfigs` is correctly typed.

## Testing
- [x] Frontend tests: `cd apps/frontend && npx vitest run` — 19 passed, 174 tests
- [x] SkillsMapChart tests: 11 tests (labels on chart, zone list, quadrant/spectrum, click callbacks)
- [x] No new lint errors in changed files

## Checklist
See [.github/PULL_REQUEST_CHECKLIST.md](.github/PULL_REQUEST_CHECKLIST.md). Confirmed:
- [x] Branch up to date with `staging`, pushed to `feature/skills-map-redesign-and-tests`
- [x] New behavior covered by tests (SkillsMapChart + existing config tests)
- [x] No secrets in commits
- [ ] Lint/type-check: project has pre-existing ESLint/TS errors; changed files have no new linter errors
