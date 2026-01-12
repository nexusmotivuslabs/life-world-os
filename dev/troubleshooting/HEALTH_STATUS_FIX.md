# Health Status Endpoint Fix

## Problem

The `/api/health/status` endpoint was returning a 500 Internal Server Error.

## Root Cause

The Prisma schema's `ActivityType` enum doesn't include `REST`, but the TypeScript code was trying to query for `ActivityType.REST` in recovery action queries. This caused a Prisma query error because `REST` doesn't exist in the database enum.

**Prisma Schema:**
```prisma
enum ActivityType {
  WORK_PROJECT
  EXERCISE
  SAVE_EXPENSES
  LEARNING
  SEASON_COMPLETION
  MILESTONE
  CUSTOM
}
```

**TypeScript Code (before fix):**
```typescript
activityType: {
  in: [
    ActivityType.EXERCISE,
    ActivityType.LEARNING,
    ActivityType.SAVE_EXPENSES,
    ActivityType.REST, // ❌ Not in Prisma schema!
  ],
}
```

## Solution

Removed `ActivityType.REST` from the recovery action queries in `health.ts`:

1. **Recovery actions count query** - Removed REST from the `in` array
2. **Last recovery action query** - Removed REST from the `in` array

The endpoint now only queries for recovery actions that exist in the database enum.

## Future Improvement

To fully support REST as a recovery action:
1. Add `REST` to the Prisma `ActivityType` enum
2. Run a migration: `npm run migrate`
3. Re-add `ActivityType.REST` to the queries

## Files Modified

- `apps/backend/src/routes/health.ts`
  - Removed `ActivityType.REST` from recovery action queries
  - Added comments explaining the temporary exclusion

## Error Handling

Also improved error handling to provide more detailed error messages in development mode:
- Error message is now included in the response
- Stack trace is included in development mode
- Better console logging for debugging

