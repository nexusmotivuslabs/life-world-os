# Migration Guide: Systems Hierarchy & Cross-System Principles

## Summary

This migration adds:
1. **SYSTEMS node** under REALITY root
2. **Cross-System State Principles** (Trust, Reputation, Optionality, Energy Reserve)
3. **New categories**: CROSS_SYSTEM, SYSTEM_TIER, SYSTEM
4. **Tree display**: REALITY now displays as "ROOT"

## Database Migration

### Step 1: Add Enum Values

Since Prisma enum additions require manual SQL, run this in your database:

```sql
-- Add new enum values to RealityNodeCategory
ALTER TYPE "RealityNodeCategory" ADD VALUE IF NOT EXISTS 'CROSS_SYSTEM';
ALTER TYPE "RealityNodeCategory" ADD VALUE IF NOT EXISTS 'SYSTEM_TIER';
ALTER TYPE "RealityNodeCategory" ADD VALUE IF NOT EXISTS 'SYSTEM';
```

### Step 2: Generate Prisma Client

```bash
cd apps/backend
npx prisma generate
```

### Step 3: Run Seed Script

The seed script will automatically add:
- SYSTEMS node structure
- Cross-system principles
- All systems organized by tier (max 3 per level)

```bash
cd apps/backend
npm run seed
# or
npx tsx prisma/seed.ts
```

## What Was Added

### 1. Schema Changes
- Added `CROSS_SYSTEM`, `SYSTEM_TIER`, `SYSTEM` to `RealityNodeCategory` enum

### 2. Seed Script Changes
- Added `CROSS_SYSTEM_PRINCIPLES` array with 4 principles
- Added `SYSTEMS_HIERARCHY_DATA` with system structure
- Added Phase 8: SYSTEMS hierarchy seeding
- Updated principles seeding to include cross-system modifiers

### 3. Frontend Changes
- Updated `HierarchyTreeView.tsx` to display "REALITY" as "ROOT"

### 4. Documentation
- Updated `REALITY_HIERARCHY.md` with complete structure including SYSTEMS

## Structure

```
REALITY (ROOT)
├── CONSTRAINTS_OF_REALITY
│   ├── PRINCIPLES
│   │   └── Cross-System Modifiers (NEW)
│   │       ├── TRUST
│   │       ├── REPUTATION
│   │       ├── OPTIONALITY
│   │       └── ENERGY_RESERVE
│   └── ...
└── SYSTEMS (NEW)
    ├── SURVIVAL_TIER
    ├── STABILITY_TIER
    ├── GROWTH_TIER
    ├── EXPRESSION_TIER
    └── CROSS_SYSTEM_STATES
```

## Constraints

- **Max 3 instances per level** (enforced in seed script with `.slice(0, 3)`)
- **Max 5 levels total**: ROOT → Tier → System → Sub-System → Artifact
- **Efficient seeding**: Uses batch operations and limits

## Testing in Dev

1. Apply SQL migration
2. Generate Prisma client
3. Run seed script
4. Verify in UI: `/knowledge/hierarchy` should show ROOT with SYSTEMS branch
5. Verify principles include Trust, Reputation, Optionality, Energy Reserve

## Notes

- TypeScript may show errors until Prisma client is regenerated
- All new nodes use upsert pattern (safe to re-run)
- Existing nodes are not modified (additive only)

