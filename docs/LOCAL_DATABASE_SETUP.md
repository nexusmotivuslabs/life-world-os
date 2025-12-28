# Local Database Setup

## Overview

**Local environment connects to DEV database by default.**

- **Local**: Development environment running on your machine (ports 5001/5002)
- **Dev Database**: Shared PostgreSQL database (port 5433) with all required data
- **Local uses Dev**: Local connects to dev database for consistency

## Why Local Uses Dev Database

1. **Consistency**: Same data across all developers
2. **Complete Data**: Dev database has all required seed data
3. **No Duplication**: One source of truth
4. **Easy Updates**: Update dev database, all local instances see changes

## Configuration

### Backend `.env.local`

```env
# Connects to DEV database
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
```

### Database Connection

- **Host**: localhost
- **Port**: 5433 (Docker dev database)
- **Database**: lifeworld_dev
- **User**: lifeworld_dev
- **Password**: lifeworld_dev_local

## Starting Dev Database

```bash
# Start dev database
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Check status
docker-compose -f docker-compose.dev.yml ps postgres-dev
```

## Seeding Dev Database

Dev database should have all required data:

```bash
cd apps/backend

# Full seed (all data)
npm run seed

# Or seed for specific environment
npm run seed:dev
```

This seeds:
- ✅ Reality hierarchy (REALITY root + all nodes)
- ✅ Laws, Principles, Frameworks
- ✅ Power Laws, Bible Laws
- ✅ Loadout Items
- ✅ Money System (Agents, Teams)
- ✅ Training and Knowledge
- ✅ Development test users (dev only)

## Optional: Local Sample Database

If you want a smaller local database (10% sample):

```bash
# Create local sample (optional)
npm run seed:local-sample
```

**Note**: This is optional. Most developers should use dev database directly.

## Troubleshooting

### "Unable to load hierarchy data"

1. **Check database is running:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps postgres-dev
   ```

2. **Check database connection:**
   ```bash
   psql postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev -c "SELECT COUNT(*) FROM reality_nodes;"
   ```

3. **Seed database if empty:**
   ```bash
   cd apps/backend
   npm run seed
   ```

4. **Check backend is connected:**
   ```bash
   curl http://localhost:5001/api/health
   ```

### Database Connection Errors

1. **Verify DATABASE_URL in `.env.local`:**
   ```bash
   cat apps/backend/.env.local | grep DATABASE_URL
   ```

2. **Restart backend:**
   ```bash
   # Kill backend process
   lsof -ti:5001 | xargs kill -9
   
   # Restart
   cd apps/backend && PORT=5001 npm run dev
   ```

3. **Check Prisma Client:**
   ```bash
   cd apps/backend
   npm run generate
   ```

## Data Flow

```
┌─────────────────┐
│  Local Backend  │
│  (Port 5001)    │
└────────┬─────────┘
         │
         │ DATABASE_URL
         │ (from .env.local)
         ▼
┌─────────────────┐
│  Dev Database   │
│  (Port 5433)    │
│  Docker         │
└─────────────────┘
```

## Best Practices

1. **Always use dev database** for local development
2. **Seed dev database** when setting up or after schema changes
3. **Don't create separate local database** unless testing sampling
4. **Sync data** using `npm run sync:nodes` if needed

## Summary

- ✅ Local connects to dev database (port 5433)
- ✅ Dev database has all required data
- ✅ One source of truth for all developers
- ✅ Easy to update and maintain

