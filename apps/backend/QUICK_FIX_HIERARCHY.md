# Quick Fix: Hierarchy Data Loading Error

## The Problem

Error: "Unable to load hierarchy data. Please ensure the backend server is running and the database is seeded."

## Quick Solution

### Option 1: Automated Fix (Recommended)

```bash
cd apps/backend
npm run fix:hierarchy
```

This script will:
1. Check if backend is running
2. Check if database is seeded
3. Seed the database if needed

### Option 2: Manual Fix

```bash
cd apps/backend

# 1. Make sure backend is running (in another terminal)
npm run dev

# 2. In this terminal, seed the database
npm run seed
```

### Option 3: Full Reset (if above doesn't work)

```bash
cd apps/backend

# Reset and reseed
npm run migrate:reset  # WARNING: Deletes all data
npm run seed
```

## Verify It's Fixed

```bash
# Test the endpoint
curl http://localhost:3001/api/reality-nodes/reality-root

# Should return JSON, not an error
```

Then refresh your frontend - the hierarchy should load!

## Still Not Working?

See detailed guide: `HIERARCHY_TROUBLESHOOTING.md`

