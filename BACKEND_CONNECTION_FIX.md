# Backend Connection Fix

**Issue**: `ERR_CONNECTION_REFUSED` on `http://localhost:5001/api/health`

---

## Quick Fix

### Option 1: Use Start Script (Recommended)
```bash
npm run dev:backend:start
```

This script:
- Checks if port 5001 is available
- Starts database if needed
- Installs dependencies if missing
- Generates Prisma Client if needed
- Starts backend on port 5001
- Verifies health endpoint

### Option 2: Manual Start
```bash
# 1. Start database
npm run dev:db

# 2. Start backend
cd apps/backend
PORT=5001 npm run dev
```

### Option 3: Full Dev Environment
```bash
npm run dev:start
```

---

## Troubleshooting

### Port 5001 Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or use the start script (it handles this)
npm run dev:backend:start
```

### Database Not Running
```bash
# Start database
npm run dev:db

# Check database status
docker ps | grep postgres
```

### Dependencies Missing
```bash
cd apps/backend
npm install
npm run generate  # Generate Prisma Client
```

### Environment Variables Missing
```bash
# Check if .env.local exists
ls apps/backend/.env.local

# Create from example if needed
cp apps/backend/.env.local.example apps/backend/.env.local
```

### Backend Crashes
```bash
# Check logs
tail -f /tmp/life-world-backend.log

# Or check console output if running directly
cd apps/backend
PORT=5001 npm run dev
```

---

## Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:5001/api/health

# Check if port is listening
lsof -ti:5001

# Check process
ps aux | grep "node.*backend\|tsx.*backend"
```

---

## Expected Response

Health endpoint should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "version": "..."
}
```

---

## Common Issues

### 1. Database Connection Error
- Ensure database is running: `npm run dev:db`
- Check database URL in `.env.local`
- Verify database is healthy: `docker ps | grep postgres`

### 2. Prisma Client Not Generated
```bash
cd apps/backend
npm run generate
```

### 3. Port Conflict
- Backend expects port 5001
- Frontend expects backend on 5001
- Change port in backend if needed: `PORT=5002 npm run dev`
- Update frontend API URL accordingly

### 4. CORS Issues
- Backend CORS is configured for `localhost:5002` (frontend)
- If frontend runs on different port, update CORS in `apps/backend/src/index.ts`

---

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev:backend:start` | Start backend (with checks) |
| `npm run dev:backend` | Start backend (direct) |
| `npm run dev:db` | Start database |
| `npm run dev:start` | Start full dev environment |
| `curl http://localhost:5001/api/health` | Test backend |

---

**Status**: Backend should be accessible at `http://localhost:5001` once started.

