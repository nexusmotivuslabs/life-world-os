# Admin Setup Guide

Admin access in Life World OS is **only configurable in the database**. The Admin interface is only visible to users with `isAdmin: true` in the database.

## Setting Up Admin Users

### Step 1: Run Database Migration

First, add the `isAdmin` field to the User model:

```bash
cd apps/backend
npx prisma migrate dev --name add_is_admin_field
```

This will create and apply a migration that adds the `isAdmin` boolean field to the users table.

### Step 2: Set Admin Users

**For Development (make all users admin):**
```bash
cd apps/backend
npx tsx src/scripts/setAdminUsers.ts --all
# OR
DEV_MODE=true npx tsx src/scripts/setAdminUsers.ts
```

**For Production (set specific emails):**
```bash
cd apps/backend
# Edit ADMIN_EMAILS in src/scripts/setAdminUsers.ts first
npx tsx src/scripts/setAdminUsers.ts
```

**Or manually via database:**

```sql
-- Set specific users as admin
UPDATE users SET "isAdmin" = true WHERE email = 'nicoleeb.taylor@gmail.com';
UPDATE users SET "isAdmin" = true WHERE email = 'your-email@example.com';

-- Verify admin users
SELECT email, username, "isAdmin" FROM users WHERE "isAdmin" = true;
```

### Step 3: Verify Admin Access

1. Log in as an admin user
2. The Admin link should appear in the header (top-right)
3. Access `/admin` route - should show admin settings
4. Non-admin users will see 403 Forbidden if they try to access `/admin`

## Admin Users

Current admin users (configured in `apps/backend/src/scripts/setAdminUsers.ts`):
- `nicoleeb.taylor@gmail.com`
- (Add your email to the script)

## Security Notes

- Admin status can **only** be changed via:
  - Direct database access
  - The `setAdminUsers.ts` script
- Admin routes are protected by `requireAdmin` middleware
- Frontend checks `dashboard.user.isAdmin` to show/hide Admin link
- Admin API endpoints return 403 Forbidden for non-admin users

## Admin Routes

Protected admin routes:
- `PUT /api/xp/admin` - Direct XP updates
- `PUT /api/resources/admin` - Direct resource updates
- `/admin` (frontend) - Admin settings page

