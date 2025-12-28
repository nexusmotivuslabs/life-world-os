# System Health Troubleshooting Guide

## Quick Start: Making All Systems Healthy

### 1. Backend API Health

**Issue**: Backend API shows as unhealthy

**Steps to Fix**:
```bash
# 1. Navigate to backend directory
cd apps/backend

# 2. Check if backend is running
# If not running, start it:
npm run dev

# 3. Verify backend is accessible
curl http://localhost:3001/api/health

# 4. Check environment variables
# Ensure PORT is set (default: 3001)
# Check .env file exists and is configured
```

**Common Issues**:
- Port 3001 already in use → Change PORT in .env or kill the process using port 3001
- Backend not starting → Check logs for errors, verify dependencies installed (`npm install`)
- CORS errors → Ensure frontend URL is allowed in backend CORS config

### 2. Database Health

**Issue**: Database shows as unhealthy

**Steps to Fix**:
```bash
# 1. Verify PostgreSQL is running
# macOS:
brew services list | grep postgresql
# If not running:
brew services start postgresql

# Linux:
sudo systemctl status postgresql
# If not running:
sudo systemctl start postgresql

# 2. Check database connection
cd apps/backend
npx prisma db pull

# 3. Run migrations if needed
npx prisma migrate dev

# 4. Verify connection string in .env
# Should be: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

**Common Issues**:
- Database not running → Start PostgreSQL service
- Wrong connection string → Update DATABASE_URL in backend .env
- Database doesn't exist → Create database: `createdb your_database_name`
- Migration issues → Run `npx prisma migrate reset` (WARNING: deletes data)

### 3. Frontend Configuration

**Issue**: Frontend can't connect to backend

**Steps to Fix**:
```bash
# 1. Check frontend .env file
# Should have: VITE_API_URL=http://localhost:3001

# 2. Verify backend URL matches
# Frontend VITE_API_URL should match backend PORT

# 3. Restart frontend after changing .env
cd apps/frontend
npm run dev
```

**Common Issues**:
- Wrong API URL → Update VITE_API_URL in frontend .env
- CORS errors → Backend needs to allow frontend origin
- Network issues → Check firewall, ensure both services are on same network

### 4. Google Places API (Optional)

**Issue**: Google Places API shows as degraded/unhealthy

**Steps to Fix**:
```bash
# 1. Get Google Places API key
# - Go to Google Cloud Console
# - Enable Places API
# - Create API key
# - Restrict key to Places API only

# 2. Add to backend .env
GOOGLE_PLACES_API_KEY=your_api_key_here

# 3. Restart backend
cd apps/backend
npm run dev
```

**Note**: Google Places API is optional. The app works without it, but travel features will be limited.

### 5. Quick Fix Checklist

**Automated Fixes** (via Quick Health Fix button):
- ✅ Clears all caches
- ✅ Refreshes health checks
- ✅ Attempts automatic recovery

**Manual Fixes Required**:
1. **Backend not running** → Start backend server
2. **Database not running** → Start PostgreSQL
3. **Wrong configuration** → Update .env files
4. **Port conflicts** → Change ports or kill conflicting processes
5. **Missing dependencies** → Run `npm install` in both frontend and backend

### 6. Verification Steps

After fixing issues, verify all systems:

```bash
# 1. Check backend health
curl http://localhost:3001/api/health

# 2. Check database health
curl http://localhost:3001/api/health/database

# 3. Check frontend
# Open browser console, should see no errors
# Navigate to Master Money System
# Check System Health Dashboard shows all green
```

### 7. Environment Variables Checklist

**Backend (.env)**:
```
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
GOOGLE_PLACES_API_KEY=your_key_here (optional)
OLLAMA_URL=http://localhost:11434 (if using Ollama)
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:3001
```

### 8. Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Backend API is not responding" | Start backend server |
| "Database connection failed" | Start PostgreSQL, check DATABASE_URL |
| "Network error" | Check VITE_API_URL, ensure backend is running |
| "CORS error" | Update backend CORS config to allow frontend origin |
| "Port already in use" | Change PORT or kill process using the port |

### 9. Health Status Meanings

- **Healthy** ✅: Component is working correctly
- **Degraded** ⚠️: Component works but with limitations (e.g., optional API not configured)
- **Unhealthy** ❌: Component is not working and needs attention
- **Checking** 🔄: Health check in progress
- **Unknown** ❓: Status not yet determined

### 10. Getting Help

If issues persist:
1. Check browser console for errors
2. Check backend logs for errors
3. Verify all services are running
4. Review environment variables
5. Try the Quick Health Fix button
6. Review Health Diagnostics component for specific steps

