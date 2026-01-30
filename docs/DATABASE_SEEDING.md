# Database Seeding Guide

## Important: Seeding is NOT Automatic

**Seeding does NOT run automatically when containers start.** This is intentional because:

1. Seeding is time-consuming (can take 1-2 minutes)
2. Seeding is idempotent (safe to run multiple times)
3. Data persists in Docker volumes between container restarts
4. You only need to seed when setting up a new environment or after resetting the database

## When Do You Need to Seed?

### Initial Setup
- First time setting up dev/staging/prod environment
- After running `docker-compose down -v` (removes volumes)

### After Database Reset
- When you delete and recreate database volumes
- When you reset the database to a clean state

### When You See "Data Connection Issue"
- If the frontend shows "Data Connection Issue" or missing data
- This usually means the database hasn't been seeded yet

### NOT Needed When:
- ✅ Restarting containers (`docker-compose restart`)
- ✅ Stopping and starting containers (`docker-compose down` then `up`)
- ✅ Updating application code (data persists in volumes)
- ✅ Running migrations (migrations don't affect seed data)

## How to Seed

### Development Environment

**Option 1: Using the seed script (recommended)**
```bash
npm run seed:dev
# or
./scripts/seed-dev.sh
```

**Option 2: Manual command**
```bash
docker exec life-world-os-backend-dev npm run seed
```

### Staging Environment

**Option 1: Using the seed script (recommended)**
```bash
npm run seed:staging
# or
./scripts/seed-staging.sh
```

**Option 2: Manual command**
```bash
docker exec life-world-os-backend-staging npm run seed
```

### Production Environment

**⚠️ Never seed production automatically!**

For production, seeding should be:
- Done manually during initial setup
- Part of your deployment documentation
- Verified before going live
- Never run automatically to avoid overwriting production data

If needed, seed production manually:
```bash
docker exec life-world-os-backend-prod npm run seed
```

## What Gets Seeded?

The seed script (`apps/backend/prisma/seed.ts`) runs multiple seed scripts in order:

1. **Core Reality Hierarchy** - Foundation nodes and structure
2. **Energy States** - Energy system data
3. **Laws and Principles** - Power Laws and Bible Laws
4. **Weapons and Capabilities** - Loadout items
5. **Money System** - Agents and Teams
6. **Training and Knowledge** - Training modules, health knowledge, awareness layers
7. **Development test users** (dev only) - Test and demo users for Life World OS login and health/capacity demos. See **[TEST_USERS.md](./TEST_USERS.md)** for emails, passwords, and usage.

## Seed Script Features

- **Idempotent**: Safe to run multiple times (won't create duplicates)
- **Environment-aware**: Works for dev, staging, and prod
- **Error handling**: Continues even if individual seed scripts fail
- **Progress logging**: Shows detailed progress of each phase

## Troubleshooting

### Seed Script Fails

1. **Check container is running**
   ```bash
   docker ps | grep backend
   ```

2. **Check database is accessible**
   ```bash
   docker exec life-world-os-backend-dev npx prisma db pull
   ```

3. **Check logs**
   ```bash
   docker logs life-world-os-backend-dev
   ```

4. **Run migrations first**
   ```bash
   docker exec life-world-os-backend-dev npx prisma migrate deploy
   ```

### Data Still Missing After Seeding

1. **Verify seed ran successfully**
   - Check the seed script output for errors
   - All phases should show ✅

2. **Check database directly**
   ```bash
   docker exec -it life-db-dev psql -U lifeworld_dev -d lifeworld_dev
   # Then run: SELECT COUNT(*) FROM "PowerLaw";
   ```

3. **Check backend validation**
   ```bash
   docker logs life-world-os-backend-dev | grep validation
   ```

4. **Restart backend** (sometimes needed to refresh cached data)
   ```bash
   docker restart life-world-os-backend-dev
   ```

### "Data Connection Issue" Error

This error appears when:
- Database hasn't been seeded
- Backend can't connect to database
- Required seed data is missing

**Solution:**
1. Ensure database container is running: `docker ps | grep postgres`
2. Run seed script: `npm run seed:dev`
3. Check backend logs: `docker logs life-world-os-backend-dev`
4. Verify health endpoint: `curl http://localhost:3001/api/health`

## Quick Reference

```bash
# Development
npm run seed:dev              # Seed dev database
docker logs life-world-os-backend-dev  # View logs

# Staging  
npm run seed:staging          # Seed staging database
docker logs life-world-os-backend-staging  # View logs

# Check if seeded
docker exec life-world-os-backend-dev npx prisma studio  # Opens Prisma Studio
```

## Best Practices

1. **Seed during initial setup** - Always seed when creating a new environment
2. **Document seeding in your deployment process** - Include seeding steps in your deployment docs
3. **Verify after seeding** - Check that data is present using Prisma Studio or queries
4. **Don't seed production automatically** - Production seeding should be manual and intentional
5. **Keep seed scripts up to date** - When adding new required data, update seed scripts

## Related Documentation

- [Database Setup Guide](../DOCKER_ENVIRONMENT_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)

