# Restart Guide - After Large Changes

This guide provides multiple methods to restart the application after large changes (like navigation refactors, major updates, etc.).

## 🚀 Quick Restart Methods

### Method 1: Frontend Restart Script (Fastest)
```bash
cd apps/frontend
./restart-dev.sh
```

### Method 2: Manual Frontend Restart
```bash
cd apps/frontend

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Clear Vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Method 3: Full Stack Restart (Root)
```bash
# From project root
npm run dev
```

## 🐳 Docker-Based Restart

### Using Docker Compose (Recommended for Clean Restarts)

#### Restart Database Only
```bash
# Stop database
docker-compose down postgres

# Start database
docker-compose up -d postgres

# Wait for health check
docker-compose ps
```

#### Full Docker Restart (Database + Services)
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (⚠️ This deletes database data!)
# docker-compose -f docker-compose.dev.yml down -v

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### Restart with Clean State
```bash
# Stop everything
docker-compose -f docker-compose.dev.yml down

# Remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Rebuild and start
docker-compose -f docker-compose.dev.yml up -d --build

# Check status
docker-compose -f docker-compose.dev.yml ps
```

## 🔧 Force Restart Commands

### Kill All Related Processes
```bash
# Kill frontend (port 5173)
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Kill backend (port 3001)
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Kill all Node processes (⚠️ Use with caution)
pkill -f "node.*vite"
pkill -f "tsx.*watch"
```

### Clear All Caches
```bash
cd apps/frontend

# Clear Vite cache
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# Clear npm cache (optional)
npm cache clean --force

# Reinstall dependencies (if needed)
npm install
```

### Nuclear Option (Complete Reset)
```bash
# From project root

# Kill all processes
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
pkill -f "vite"
pkill -f "tsx"

# Stop Docker containers
docker-compose down

# Clear frontend caches
cd apps/frontend
rm -rf node_modules/.vite dist .vite

# Clear backend caches
cd ../backend
rm -rf dist node_modules/.cache

# Restart everything
cd ../..
docker-compose up -d postgres
npm run dev
```

## 📋 Step-by-Step: After Large Changes

### Recommended Workflow

1. **Stop Running Services**
   ```bash
   # Kill frontend
   lsof -ti:5173 | xargs kill -9 2>/dev/null
   
   # Kill backend (if running separately)
   lsof -ti:3001 | xargs kill -9 2>/dev/null
   ```

2. **Clear Caches**
   ```bash
   cd apps/frontend
   rm -rf node_modules/.vite
   ```

3. **Verify TypeScript**
   ```bash
   npm run type-check
   ```

4. **Restart Services**
   ```bash
   # Option A: Use restart script
   ./restart-dev.sh
   
   # Option B: Manual restart
   npm run dev
   ```

5. **Verify Server Started**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Check browser console for errors

## 🐳 Docker-Specific Commands

### Check Container Status
```bash
docker-compose -f docker-compose.dev.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Restart Specific Service
```bash
docker-compose -f docker-compose.dev.yml restart postgres
```

### Rebuild Containers
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### Clean Docker State
```bash
# Remove containers, networks, and volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove unused Docker resources
docker system prune -a
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :5173
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Module Not Found Errors
```bash
cd apps/frontend
rm -rf node_modules
npm install
```

### Type Errors After Changes
```bash
# Run type check
npm run type-check

# Fix errors, then restart
./restart-dev.sh
```

### Docker Issues
```bash
# Check Docker is running
docker ps

# Restart Docker service (macOS)
# System Preferences > Docker > Restart

# Restart Docker service (Linux)
sudo systemctl restart docker
```

## ✅ Verification Checklist

After restarting, verify:

- [ ] Frontend server responds at http://localhost:5173
- [ ] Backend server responds at http://localhost:3001 (if running)
- [ ] Database is accessible (if using Docker)
- [ ] No console errors in browser
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] Navigation works correctly
- [ ] Routes load without 404 errors

## 📝 Notes

- **Vite Cache**: Always clear `node_modules/.vite` after large changes
- **TypeScript**: Run `type-check` before restarting to catch errors early
- **Docker**: Use `docker-compose.dev.yml` for development
- **Hot Reload**: Vite should handle most changes automatically, but major refactors may need a full restart

## 🚨 Emergency Reset

If nothing works:

```bash
# Complete reset
cd /path/to/life-world-os

# Kill everything
pkill -f node
pkill -f vite
pkill -f tsx

# Stop Docker
docker-compose down -v

# Clear all caches
cd apps/frontend && rm -rf node_modules/.vite dist .vite
cd ../backend && rm -rf dist

# Reinstall (if needed)
cd ../.. && npm install

# Fresh start
docker-compose up -d postgres
npm run dev
```

