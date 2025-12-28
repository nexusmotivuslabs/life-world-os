# Quick Fix: Backend Connection Refused

**Issue**: `ERR_CONNECTION_REFUSED` on `http://localhost:5001/api/health`

---

## ✅ Solution

### 1. Install Backend Dependencies
```bash
cd apps/backend
npm install
npm run generate  # Generate Prisma Client
```

### 2. Start Database
```bash
npm run dev:db
```

### 3. Start Backend
```bash
# Option A: Use the startup script (recommended)
npm run dev:backend:start

# Option B: Manual start
cd apps/backend
PORT=5001 npm run dev
```

### 4. Verify Backend is Running
```bash
curl http://localhost:5001/api/health
```

Should return:
```json
{
  "status": "healthy",
  ...
}
```

---

## Frontend Configuration

The frontend is configured to use:
- **Default**: `http://localhost:5001` (via Vite proxy)
- **Environment Variable**: `VITE_API_URL` (if set)

### Check Frontend Config
```bash
# Check if .env.local exists
cat apps/frontend/.env.local

# Should contain:
# VITE_API_URL=http://localhost:5001
```

---

## Fixed Issues

1. ✅ **GuideBot.tsx**: Updated default API URL from `3001` to `5001`
2. ✅ **Backend Startup Script**: Created `start-backend.sh` with health checks
3. ✅ **NPM Script**: Added `dev:backend:start` command

---

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev:backend:start` | Start backend (with checks) |
| `npm run dev:db` | Start database |
| `npm run dev:start` | Start full dev environment |
| `curl http://localhost:5001/api/health` | Test backend |

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
tail -f /tmp/life-world-backend.log

# Check port
lsof -ti:5001

# Kill and restart
lsof -ti:5001 | xargs kill -9
npm run dev:backend:start
```

### Database Connection Error
```bash
# Check database is running
docker ps | grep postgres

# Start database
npm run dev:db

# Check database URL in apps/backend/.env.local
```

### Frontend Still Can't Connect
1. Verify backend is running: `curl http://localhost:5001/api/health`
2. Check browser console for errors
3. Verify `VITE_API_URL` in `apps/frontend/.env.local`
4. Restart frontend dev server

---

**Status**: Backend should now be accessible at `http://localhost:5001`

