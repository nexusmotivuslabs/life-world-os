# PR Checklist (author / agent self-check)

Use this before opening a PR or when reviewing your own changes.

## Pre-PR

- [ ] Branch is up to date with base (e.g. `staging`) or rebased
- [ ] All new/updated code is committed (no unintended local changes)
- [ ] No secrets or env-specific values committed
- [ ] Lint passes for changed files (`npm run lint` where applicable)
- [ ] Type-check passes (`tsc --noEmit` or project equivalent)
- [ ] Existing tests pass (backend + frontend `npm test`)
- [ ] New behavior covered by tests where practical (no drop in coverage)
- [ ] Coverage thresholds met: `npm run test:coverage` (90% lines/statements on covered files; see `.cursor/rules/test-coverage-pr.mdc`)

## Scope & docs

- [ ] PR title and description match the change set
- [ ] Breaking changes or config/env changes called out in description
- [ ] Docs/README updated if user-facing or setup steps changed
- [ ] Reality hierarchy or system config docs updated if hierarchy/config changed

## Data & migrations

- [ ] DB schema changes: migration added or `db push` noted with reason
- [ ] Seed scripts run successfully after schema changes
- [ ] No destructive data changes without a clear migration/rollback path

## Post-push

- [ ] Branch pushed to remote; CI runs if configured
- [ ] PR opened against correct base branch; link added in description if needed
- [ ] Checklist copy-pasted into PR description (or “See .github/PULL_REQUEST_CHECKLIST.md”) so reviewers know what was verified

## Notes

- Keep the list short; add project-specific items (e.g. “Run seed”, “E2E”) as needed.
- When acting as author: run through the list and tick off before “Create PR”.
- When acting as reviewer: use as a reminder of what to verify; add review comments for any unchecked or failed items.
