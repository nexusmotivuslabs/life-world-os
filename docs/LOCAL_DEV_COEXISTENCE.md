# Local & Dev Environment Coexistence

## Overview

Local and Dev environments are designed to work together harmoniously:
- **Local**: Runs on your machine (ports 5001/5002)
- **Dev**: Runs in Docker (ports 3001/5173)
- **Shared**: Both use the same dev database (port 5433)

## Port Allocation

### Local Environment
- **Backend**: Port 5001
- **Frontend**: Port 5002
- **Database**: Connects to dev database (port 5433)

### Dev Environment (Docker)
- **Backend**: Port 3001
- **Frontend**: Port 5173
- **Database**: Port 5433 (shared)

### No Conflicts
✅ Ports are completely separate - both can run simultaneously

## Architecture

```
┌─────────────────────────────────────────┐
│  Dev Database (Docker)                  │
│  Port: 5433                             │
│  Shared by both environments            │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ Local       │  │ Dev (Docker) │
│ Backend     │  │ Backend      │
│ Port: 5001  │  │ Port: 3001   │
└──────┬──────┘  └──────┬───────┘
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ Local       │  │ Dev (Docker) │
│ Frontend    │  │ Frontend     │
│ Port: 5002  │  │ Port: 5173   │
└─────────────┘  └──────────────┘
```

## Configuration

### Local Environment Files

**Backend** (`apps/backend/.env.local`):
```env
PORT=5001
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
```

**Frontend** (`apps/frontend/.env.local`):
```env
VITE_API_URL=http://localhost:5001
```

### Dev Environment Files

**Backend** (Docker - uses `.env.dev`):
```env
PORT=3001
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@postgres-dev:5432/lifeworld_dev
```

**Frontend** (Docker - uses `.env.dev`):
```env
VITE_API_URL=http://localhost:3001
```

## CORS Configuration

Backend CORS allows both environments:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5002',  // Local frontend
    'http://localhost:5173',  // Dev frontend
    'http://localhost:3000',  // Grafana
    'http://dev.lifeworld.com:5002',
  ],
  credentials: true,
}))
```

## Running Both Simultaneously

### Scenario 1: Local Development + Dev Testing

**Use Case**: You're developing locally but want to test against dev services

```bash
# Terminal 1: Start dev database (shared)
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Terminal 2: Start local backend
cd apps/backend && PORT=5001 npm run dev

# Terminal 3: Start local frontend
cd apps/frontend && npm run dev

# Terminal 4: Start dev backend (optional)
docker-compose -f docker-compose.dev.yml up -d backend-dev

# Terminal 5: Start dev frontend (optional)
docker-compose -f docker-compose.dev.yml up -d frontend-dev
```

**Access**:
- Local: http://localhost:5002
- Dev: http://localhost:5173

### Scenario 2: Local Only (Recommended)

**Use Case**: Fast development iteration

```bash
# Start shared database
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Start local services
npm run dev:local
```

**Access**: http://localhost:5002

### Scenario 3: Dev Only (Docker)

**Use Case**: Testing Docker setup

```bash
# Start everything in Docker
docker-compose -f docker-compose.dev.yml --profile full up -d
```

**Access**: http://localhost:5173

## Database Sharing

### Why Share Database?

1. **Consistency**: All developers see same data
2. **No Duplication**: One source of truth
3. **Easy Updates**: Update once, everyone sees changes
4. **Testing**: Test against real dev data

### Database Connection

Both environments connect to the same database:
- **Local**: `localhost:5433` (host machine → Docker port mapping)
- **Dev**: `postgres-dev:5432` (Docker internal network)

### Seeding

Seed the shared dev database:
```bash
cd apps/backend
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev npm run seed
```

## Environment Detection

### Backend Detection

Backend detects environment from:
- `process.env.PORT` (5001 = local, 3001 = dev)
- `process.env.NODE_ENV`
- Database connection string

### Frontend Detection

Frontend detects environment from:
- `import.meta.env.DEV` (Vite dev mode)
- `import.meta.env.VITE_API_URL`

## Best Practices

### 1. Use Local for Development
- ✅ Fast iteration
- ✅ Hot reload
- ✅ Easy debugging
- ✅ Direct log access

### 2. Use Dev for Testing
- ✅ Docker validation
- ✅ Integration testing
- ✅ CI/CD simulation

### 3. Share Database
- ✅ Always use dev database
- ✅ Don't create separate local database
- ✅ Seed dev database when needed

### 4. Port Management
- ✅ Local: 5001/5002 (never conflicts)
- ✅ Dev: 3001/5173 (Docker standard)
- ✅ Database: 5433 (shared)

## Troubleshooting

### Port Conflicts

**Error**: `Port already in use`

**Solution**:
```bash
# Check what's using the port
lsof -i:5001
lsof -i:5002

# Kill if needed
lsof -ti:5001 | xargs kill -9
lsof -ti:5002 | xargs kill -9
```

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:
1. Check database is running:
   ```bash
   docker-compose -f docker-compose.dev.yml ps postgres-dev
   ```

2. Verify connection string:
   ```bash
   # Local should use localhost:5433
   echo $DATABASE_URL
   ```

3. Test connection:
   ```bash
   psql postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev -c "SELECT 1;"
   ```

### CORS Errors

**Error**: `CORS policy blocked`

**Solution**:
1. Verify backend CORS includes your frontend port
2. Check backend is running on correct port
3. Restart backend after CORS changes

### Environment Confusion

**Problem**: Not sure which environment is running

**Solution**:
```bash
# Check local backend
curl http://localhost:5001/api/health

# Check dev backend
curl http://localhost:3001/api/health

# Check which ports are in use
lsof -i:5001 -i:5002 -i:3001 -i:5173
```

## Quick Reference

### Start Local
```bash
npm run dev:local
```

### Start Dev (Docker)
```bash
docker-compose -f docker-compose.dev.yml --profile full up -d
```

### Start Both
```bash
# Database (shared)
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Local services
npm run dev:local

# Dev services (separate terminals)
docker-compose -f docker-compose.dev.yml --profile backend up -d
docker-compose -f docker-compose.dev.yml --profile frontend up -d
```

### Stop Services
```bash
# Stop local
lsof -ti:5001 | xargs kill -9
lsof -ti:5002 | xargs kill -9

# Stop dev
docker-compose -f docker-compose.dev.yml down
```

## Summary

✅ **Local and Dev coexist peacefully**
- Different ports (no conflicts)
- Shared database (consistency)
- CORS configured for both
- Can run simultaneously

✅ **Recommended Setup**
- Local for active development
- Dev database for shared data
- Dev Docker for testing

✅ **No Conflicts**
- Ports: 5001/5002 (local) vs 3001/5173 (dev)
- Database: Shared on 5433
- CORS: Allows both origins

