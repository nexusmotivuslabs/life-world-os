# Test Users (Development)

Test users are created by the **development seed** so you can log into Life World OS and test the health/capacity system without registering. They are **only created in development** (`NODE_ENV=development`).

## How to Create Test Users

Run the seed **once** after migrations (from repo root or `apps/backend`):

```bash
# From repo root (uses backend workspace)
npm run seed

# Or from apps/backend
cd apps/backend && npm run seed
```

Seeding is idempotent: existing users are skipped, so you can run it again safely. Test users persist until the database is reset or volumes are removed.

## Life World OS Access (Quick Login)

Use these for general access to the app:

| Email               | Username  | Password     | Notes                          |
|---------------------|-----------|--------------|--------------------------------|
| **test@example.com** | testuser  | **password123** | Simple test user (Test User)   |
| **demo@example.com** | demouser  | **password123** | Demo user (Demo User)          |

Log in at the app login page (e.g. http://localhost:5173/login) with either email and password **password123**.

## All Development Test Users

The dev seed creates the following users. **All use password: `password123`.**

### Life World OS access

| Email               | Username  | Description                          |
|---------------------|-----------|--------------------------------------|
| test@example.com    | testuser  | Simple test user for Life World OS   |
| demo@example.com    | demouser  | Demo user for Life World OS         |

### Health / capacity demo users

| Email                      | Username              | Capacity | Description                                        |
|----------------------------|-----------------------|----------|----------------------------------------------------|
| optimal-health@dev.test   | optimal_health_user   | 90       | Optimal capacity – max energy cap, XP bonus        |
| high-capacity@dev.test    | high_capacity_user    | 75       | High capacity – good energy cap, XP bonus         |
| medium-capacity@dev.test  | medium_capacity_user  | 55       | Medium capacity – normal energy cap               |
| low-capacity@dev.test     | low_capacity_user     | 25       | Low capacity – reduced cap, XP penalty             |
| critical-capacity@dev.test| critical_capacity_user| 15       | Critical capacity – min cap, significant penalty   |
| burnout-user@dev.test     | burnout_user          | 18       | In burnout – very low cap, penalties               |
| recovery-focused@dev.test| recovery_focused_user | 45       | Actively recovering – building capacity            |

Use `/api/health/status` (when logged in) to see different capacity states and activity logs.

## When Test Users Are Created

- **Created when:** You run `npm run seed` (or `npm run seed:dev`) with the backend in **development** (`NODE_ENV=development`).
- **Not created in:** Staging or production (the dev seed script exits early unless `NODE_ENV === 'development'`).

See [DATABASE_SEEDING.md](./DATABASE_SEEDING.md) for when to run the seed and what else gets seeded.

## Security

- **Development only.** Do not use these credentials or the same passwords in staging or production.
- Test users are intended for local/dev use and for automated tests that need a known user.
