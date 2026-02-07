# Use this as the PR description when opening the PR

**Open PR:** https://github.com/nexusmotivuslabs/life-world-os/pull/new/feature/system-teams-agents  
**Base:** `staging` | **Head:** `feature/system-teams-agents`

---

## Title
`feat: Software system, 5 domain teams + 3 agents per system, system-scoped API filtering`

## Description (paste below the line)

---

## Summary
- Add **Software** system under LEVERAGE_TIER (universal concept, pathways: architecture, delivery, quality, languages, API design, agile).
- Ensure every system has **5 domain teams** and **3 agents**: new enums and seed data for Energy, Travel, Meaning, Software; extended Health, Optionality, Trust, Reputation.
- **API filtering by system**: `GET /api/teams?systemId=finance` and `GET /api/agents?systemId=software` return only that system’s teams/agents; backend `systemTeamAgentConfig` + frontend `systemId` in `useSystemData` and list APIs.

## Changes
- **Backend**: Prisma schema (new `AgentType` / `TeamDomain`), `systemTeamAgentConfig.ts`, agents/teams controllers (query param `systemId`), seed scripts (agents, teams, career systems), `systemUniversalConceptConfig` (software), `pathwayKnowledgeData` (software pathways + Pareto copy).
- **Frontend**: Software in artifact/release config, `MasterSoftware` page, `MasterDomain` + routes + nav, `useSystemData` + `agentsApi`/`teamsApi` accept `systemId`, system-specific configs (e.g. `SOFTWARE_*`, `REPUTATION_TEAM_DOMAINS`), `CareerSystemDetail` reputation domains.
- **Docs**: `REALITY_HIERARCHY.md` updated with SOFTWARE under LEVERAGE_TIER.

## Testing
- Backend: `npm test` (vitest) — all passed.
- Frontend: `npm test` (vitest) — all passed.
- Seed: `npx prisma db push && npm run generate && npm run seed` (migrate dev failed on shadow DB; used db push).

## Checklist
- [ ] See [.github/PULL_REQUEST_CHECKLIST.md](.github/PULL_REQUEST_CHECKLIST.md) for full PR checklist.
- [ ] Lint/type-check pass; existing tests pass.
- [ ] No secrets in commits; docs updated where needed.
