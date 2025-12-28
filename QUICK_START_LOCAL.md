# Quick Start - Local Development (Port 5000)

## One Command Setup

```bash
npm run dev:local
```

This will:
1. ✅ Check database is running (Docker on port 5000)
2. ✅ Create `.env.local` files if needed
3. ✅ Generate Prisma Client if needed
4. ✅ Start backend on **port 5001**
5. ✅ Start frontend on **port 5002**
6. ✅ Connect frontend to backend automatically

## Prerequisites

### 1. Start Database (Docker)

```bash
docker-compose -f docker-compose.dev.yml up -d postgres-dev
```

### 2. Verify Database

```bash
docker-compose -f docker-compose.dev.yml ps
# Should show: life-db-dev (healthy)
```

## URLs

- **Frontend:** http://localhost:5002
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/api/health
- **Database:** localhost:5000

## Manual Start (Alternative)

### Terminal 1 - Backend:
```bash
cd apps/backend
PORT=5001 npm run dev
```

### Terminal 2 - Frontend:
```bash
cd apps/frontend
npm run dev
```

## Troubleshooting

### "Failed to load health data"

1. **Check backend is running:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Check database connection:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

3. **Check .env.local files exist:**
   ```bash
   ls apps/backend/.env.local
   ls apps/frontend/.env.local
   ```

4. **Regenerate Prisma Client:**
   ```bash
   cd apps/backend
   npm run generate
   ```

### Port Already in Use

```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 5002 (frontend)
lsof -ti:5002 | xargs kill -9
```

## Next Steps

- See [Local Development Guide](./docs/LOCAL_DEVELOPMENT.md) for detailed info
- See [Docker Rebuild Guide](./docs/DOCKER_REBUILD_GUIDE.md) for Docker setup

