# Hierarchy Data Loading - Troubleshooting Guide

## Error Message

"Unable to load hierarchy data. Please ensure the backend server is running and the database is seeded."

## Quick Fix

### Step 1: Start Backend Server

```bash
cd apps/backend
npm run dev
```

The backend should start on `http://localhost:3001`

### Step 2: Verify Backend is Running

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test reality nodes endpoint
curl http://localhost:3001/api/reality-nodes/reality-root
```

### Step 3: Seed Database (if needed)

```bash
cd apps/backend

# Run migrations first
npm run migrate

# Then seed the database
npm run seed
```

The seed script will create the `reality-root` node and the entire hierarchy.

## Detailed Troubleshooting

### Issue 1: Backend Not Running

**Symptoms:**
- Error: "Unable to load hierarchy data"
- Network errors in browser console
- `curl http://localhost:3001/api/health` fails

**Solution:**
```bash
cd apps/backend
npm run dev
```

**Verify:**
- Check console for: `🚀 Life World OS Backend running on http://localhost:${PORT}`
- Test: `curl http://localhost:3001/api/health`

### Issue 2: Database Not Seeded

**Symptoms:**
- Backend is running
- API returns 404 for `/api/reality-nodes/reality-root`
- Error: "Node not found"

**Solution:**
```bash
cd apps/backend

# Check if reality-root exists
npm run db:studio
# Navigate to RealityNode table and search for "reality-root"

# If not found, seed the database
npm run seed
```

**Verify:**
```bash
# Check if node exists
curl http://localhost:3001/api/reality-nodes/reality-root

# Should return JSON with node data, not 404
```

### Issue 3: Database Connection Issues

**Symptoms:**
- Backend crashes on startup
- Database connection errors in logs
- Prisma errors

**Solution:**
1. **Check Database is Running:**
   ```bash
   # If using Docker
   docker-compose ps
   
   # Or check PostgreSQL directly
   psql -h localhost -p 5433 -U postgres -d lifeworld
   ```

2. **Check DATABASE_URL:**
   ```bash
   # In apps/backend/.env.local
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/lifeworld?schema=public"
   ```

3. **Run Migrations:**
   ```bash
   cd apps/backend
   npm run migrate
   ```

### Issue 4: CORS Issues

**Symptoms:**
- Network errors in browser
- CORS errors in console
- Frontend can't reach backend

**Solution:**
1. **Check Backend CORS Config:**
   - File: `apps/backend/src/index.ts`
   - Should include your frontend port (5002 or 5173)

2. **Verify Frontend URL:**
   - Check `apps/frontend/src/services/api.ts`
   - API base URL should match backend port

### Issue 5: Port Conflicts

**Symptoms:**
- Backend won't start
- "Port already in use" error

**Solution:**
```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process or change PORT in .env.local
PORT=3002 npm run dev
```

## Verification Checklist

- [ ] Backend server is running (`npm run dev` in `apps/backend`)
- [ ] Backend responds to health check (`curl http://localhost:3001/api/health`)
- [ ] Database is running (Docker or local PostgreSQL)
- [ ] Database migrations are up to date (`npm run migrate`)
- [ ] Database is seeded (`npm run seed`)
- [ ] `reality-root` node exists in database
- [ ] API endpoint works (`curl http://localhost:3001/api/reality-nodes/reality-root`)
- [ ] Frontend can reach backend (check CORS and API URL)

## Quick Test Commands

```bash
# 1. Test backend health
curl http://localhost:3001/api/health

# 2. Test reality nodes endpoint
curl http://localhost:3001/api/reality-nodes/reality-root

# 3. List all root nodes
curl http://localhost:3001/api/reality-nodes/roots

# 4. Check database connection (if using Prisma Studio)
cd apps/backend
npm run db:studio
# Then search for "reality-root" in RealityNode table
```

## Common Solutions

### Solution 1: Full Reset

```bash
cd apps/backend

# Stop any running processes
# Kill process on port 3001 if needed

# Reset database (WARNING: Deletes all data)
npm run migrate:reset

# Seed fresh data
npm run seed

# Start backend
npm run dev
```

### Solution 2: Just Seed Missing Data

```bash
cd apps/backend

# Run seed (idempotent - safe to run multiple times)
npm run seed
```

### Solution 3: Check Database State

```bash
cd apps/backend

# Open Prisma Studio
npm run db:studio

# Navigate to RealityNode table
# Search for: reality-root
# If missing, run: npm run seed
```

## Still Not Working?

1. **Check Backend Logs:**
   ```bash
   cd apps/backend
   npm run dev
   # Look for errors in console
   ```

2. **Check Frontend Console:**
   - Open browser DevTools (F12)
   - Check Network tab for failed requests
   - Check Console for errors

3. **Verify Environment:**
   ```bash
   # Check .env.local exists
   ls apps/backend/.env.local
   
   # Check DATABASE_URL is set
   grep DATABASE_URL apps/backend/.env.local
   ```

4. **Check Database:**
   ```bash
   # Connect to database
   psql -h localhost -p 5433 -U postgres -d lifeworld
   
   # Check if table exists
   \dt reality_nodes
   
   # Check if data exists
   SELECT COUNT(*) FROM reality_nodes;
   SELECT * FROM reality_nodes WHERE id = 'reality-root';
   ```




