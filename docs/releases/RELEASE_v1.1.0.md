# Life World OS v1.1.0

Release from `staging` — captures the state of Life World OS up to this point.

**Tag:** `v1.1.0`  
**Branch:** staging  
**Date:** 2026-02-24  

---

## Highlights

- **Blog:** Luno-style layout (latest posts largest), dark theme, metadata on preview only; reader shows post body only. Fixed blog file path resolution (monorepo root); removed entries for non-existent tech posts.
- **Hierarchy & knowledge:** Hierarchy trees load on demand, clearer connection errors, Redis cache-aside for reality nodes, constraints root mapping.
- **Auth:** Google auth auto-signup, lastName support, SetFirstName flow.
- **Systems & structure:** Structural pillars (Character foundation, Health, Career, Relationships as core tier 0), software system hierarchy and seed data, system teams and agent filtering, stress keywords as artifact tags.
- **Features:** MasterSystemLayout, ArtifactCategory mapping, KeyDetailsList, LAN access; context actions and mini tools; AI coach, runbook, prod hardening.
- **DevEx:** PR checklist and template, test fixes and pathwayKnowledgeData tests, Playwright report in .gitignore.

---

## How to use this release

- **Deploy from tag:** `git checkout v1.1.0`
- **Create GitHub release:** Create a new release, choose tag `v1.1.0`, use this file as the description.
- **Version info in app:** `node scripts/utils/get-version.js prod` will report `v1.1.0` once the tag is present.

---

## Upgrade from v1.0.0

- Run `prisma migrate deploy` if you use the backend DB.
- Ensure `blog/` exists at repo root if you use the blog; backend resolves posts from monorepo root.
- Frontend and backend package versions are 1.1.0; root package remains 1.0.0 unless you bump it.
