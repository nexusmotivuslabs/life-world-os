## Summary
Skill Leverage Matrix redesign + SystemId enum + quadrant tests. Chart shows skill labels, zone list, spectrum; all tests pass.

## Changes
- Skills Map: full-screen layout, visible labels, zone list (Focus/Leverage/Compounding/Later), single-line tooltip, stronger hover.
- SystemId enum in types; configs and Master/Career use it; relationships → Trust.
- Tests: SkillsMapChart 11 tests; 174 frontend tests pass.

## Testing
- [x] `npx vitest run` — 174 tests pass
- [x] SkillsMapChart 11 tests
- [ ] Lint/type-check: no new errors in changed files

## Checklist
See [.github/PULL_REQUEST_CHECKLIST.md](.github/PULL_REQUEST_CHECKLIST.md).
