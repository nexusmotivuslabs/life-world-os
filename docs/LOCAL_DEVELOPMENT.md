# Local Development Guide

## Quick Start

Run everything locally (database on port 5000, backend on port 5001, frontend on port 5002):

```bash
npm run dev:local
```

This script will:
- ✅ Check database is running (Docker)
- ✅ Generate Prisma Client if needed
- ✅ Start backend on port 5000
- ✅ Start frontend on port 5173
- ✅ Connect frontend to backend automatically

## Prerequisites

### 1. Database (Docker)

The database must be running in Docker:

```bash
# Start database only
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Check it's running
docker-compose -f docker-compose.dev.yml ps
```

Database connection:
- **Host:** localhost
- **Port:** 5000 (mapped from Docker container)
- **User:** lifeworld_dev
- **Password:** lifeworld_dev_local
- **Database:** lifeworld_dev

### 2. Environment Files

The script automatically creates `.env.local` files if they don't exist:

- `apps/backend/.env.local` - Backend configuration
- `apps/frontend/.env.local` - Frontend API URL

### 3. Dependencies

Install dependencies if not already done:

```bash
# Backend
cd apps/backend
npm install
npm run generate  # Generate Prisma Client

# Frontend
cd apps/frontend
npm install
```

## Manual Setup

### Option 1: Run Everything Together

```bash
npm run dev:local
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd apps/backend
PORT=5001 npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

### Option 3: Using npm scripts

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Configuration

### Backend (Port 5001)

Edit `apps/backend/.env.local`:

```env
PORT=5001
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5000/lifeworld_dev
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
```

### Frontend (Port 5002)

Edit `apps/frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5001
```

The frontend Vite dev server automatically proxies `/api/*` requests to the backend.

## URLs

- **Frontend:** http://localhost:5002
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/api/health
- **Database:** localhost:5000 (PostgreSQL)

## Troubleshooting

### Backend won't start

1. **Check database is running:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. **Check database connection:**
   ```bash
   psql postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev -c "SELECT 1;"
   ```

3. **Check Prisma Client:**
   ```bash
   cd apps/backend
   npm run generate
   ```

4. **Check ports are free:**
   ```bash
   lsof -i:5000  # Database
   lsof -i:5001  # Backend
   lsof -i:5002  # Frontend
   ```

### Frontend can't connect to backend

1. **Check backend is running:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Check VITE_API_URL:**
   ```bash
   cat apps/frontend/.env.local
   ```

3. **Check Vite proxy config:**
   ```bash
   cat apps/frontend/vite.config.ts
   ```

### Database connection errors

1. **Start database:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres-dev
   ```

2. **Check database logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres-dev
   ```

3. **Verify connection string:**
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5000/lifeworld_dev
   ```

## Development Workflow

### Hot Reload

Both backend and frontend support hot reload:

- **Backend:** Uses `tsx watch` - changes to `.ts` files restart automatically
- **Frontend:** Uses Vite HMR - changes to `.tsx` files update instantly

### Database Migrations

Run migrations when schema changes:

```bash
cd apps/backend
npm run migrate
```

### Database Seeding

Seed the database with initial data:

```bash
cd apps/backend
npm run seed:local
```

### Prisma Studio

View/edit database data:

```bash
cd apps/backend
npm run studio
```

Opens at http://localhost:5555

## Advantages of Local Development

1. **Faster iteration:** No Docker rebuild needed for code changes
2. **Better debugging:** Direct access to Node.js debugger
3. **Faster startup:** No container overhead
4. **Easier testing:** Direct access to logs and processes
5. **IDE integration:** Better TypeScript/autocomplete support

## When to Use Docker vs Local

### Use Local Development When:
- ✅ Actively coding and iterating
- ✅ Need fast feedback loops
- ✅ Debugging specific issues
- ✅ Testing new features

### Use Docker When:
- ✅ Testing production-like environment
- ✅ CI/CD pipelines
- ✅ Team consistency
- ✅ Deployment preparation

## Next Steps

- [Docker Rebuild Guide](./DOCKER_REBUILD_GUIDE.md) - For Docker-based development
- [Deployment Guide](./DEPLOYMENT.md) - For production deployment
- [Troubleshooting](./RUNBOOKS.md) - Common issues and solutions

