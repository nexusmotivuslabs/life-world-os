# Smoke Test Documentation

## Overview

The smoke test is an end-to-end test script that validates the entire application stack from database to frontend. It ensures that all services start correctly and basic functionality works.

## Usage

```bash
# Run full smoke test (database + backend + frontend)
npm run smoke-test

# Run smoke test without dump restore
npm run smoke-test -- --skip-dump-restore

# Run smoke test without frontend
npm run smoke-test -- --skip-frontend

# Run smoke test without dump restore and frontend
npm run smoke-test -- --skip-dump-restore --skip-frontend
```

## What It Tests

### Phase 1: Environment Setup
- ✅ Docker is running
- ✅ Node.js is installed
- ✅ Required files exist

### Phase 2: Database Setup
- ✅ Database container starts
- ✅ Database becomes healthy
- ✅ Database dump restoration (if dump exists)
- ✅ Database migrations run
- ✅ Database connection verified

### Phase 3: Backend Setup
- ✅ Prisma Client generation
- ✅ Backend server starts
- ✅ Health endpoint responds
- ✅ API endpoints accessible

### Phase 4: Frontend Setup (Optional)
- ✅ Frontend server starts
- ✅ Frontend is accessible

### Phase 5: Data Validation
- ✅ Reality nodes exist
- ✅ Agents exist
- ✅ Other critical data exists

## Expected Output

```
═══════════════════════════════════════════════════════
          E2E Smoke Test - Life World OS
═══════════════════════════════════════════════════════

📋 Phase 1: Environment Setup
───────────────────────────────────────────────────────
✅ PASS: Docker is running
✅ PASS: Node.js is installed (v20.x.x)
✅ PASS: Docker compose file found

🗄️  Phase 2: Database Setup
───────────────────────────────────────────────────────
ℹ️  INFO: Cleaning up existing containers...
ℹ️  INFO: Starting database container...
ℹ️  INFO: Waiting for database to be healthy...
✅ PASS: Database is healthy
ℹ️  INFO: No dump file found, database will be empty
💡 Generate dump with: npm run generate-dump:dev
ℹ️  INFO: Running database migrations...
✅ PASS: Database migrations completed
ℹ️  INFO: Verifying database connection...
✅ PASS: Database connection verified

🔧 Phase 3: Backend Setup
───────────────────────────────────────────────────────
ℹ️  INFO: Generating Prisma Client...
✅ PASS: Prisma Client generated
ℹ️  INFO: Starting backend server...
ℹ️  INFO: Waiting for backend to start...
✅ PASS: Backend server started
ℹ️  INFO: Testing backend health endpoint...
✅ PASS: Backend health check passed
ℹ️  INFO: Testing backend API endpoints...
✅ PASS: Reality nodes API accessible

🎨 Phase 4: Frontend Setup
───────────────────────────────────────────────────────
ℹ️  INFO: Starting frontend server...
ℹ️  INFO: Waiting for frontend to start...
✅ PASS: Frontend server started
ℹ️  INFO: Testing frontend accessibility...
✅ PASS: Frontend is accessible

📊 Phase 5: Data Validation
───────────────────────────────────────────────────────
ℹ️  INFO: Checking database data...
ℹ️  INFO: No reality nodes found (database may not be seeded)

═══════════════════════════════════════════════════════
                    Test Summary
═══════════════════════════════════════════════════════

Tests Passed: 12
Tests Failed: 0

✅ All smoke tests passed!

Application is running:
  📦 Database: localhost:5433
  🔧 Backend:  http://localhost:3001
  🎨 Frontend: http://localhost:5173

To stop services:
  kill <PID>
  docker-compose -f docker-compose.dev.yml down
```

## Troubleshooting

### Database Not Starting

If the database fails to start:
1. Check Docker is running: `docker info`
2. Check ports aren't in use: `lsof -i :5433`
3. Check logs: `docker logs life-db-dev`

### Backend Not Starting

If the backend fails to start:
1. Check backend logs: `tail -50 /tmp/life-world-backend.log`
2. Verify DATABASE_URL is set correctly
3. Check Prisma Client is generated: `cd apps/backend && npm run generate`

### Frontend Not Starting

If the frontend fails to start:
1. Check frontend logs: `tail -50 /tmp/life-world-frontend.log`
2. Verify VITE_API_URL is set correctly
3. Check if port 5173 is available: `lsof -i :5173`

### Dump Restore Issues

If dump restore fails:
1. Check dump file exists: `ls -lh seeds/dumps/dev-seeded-latest.dump`
2. Verify dump isn't corrupted
3. Try restoring manually: `npm run restore-db:dev`

## Integration with CI/CD

The smoke test can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/smoke-test.yml
name: Smoke Test

on: [push, pull_request]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run smoke-test -- --skip-frontend
```

## Best Practices

1. **Run before deployment**: Always run smoke test before deploying to staging/production
2. **Run after schema changes**: Verify migrations work correctly
3. **Run after environment changes**: Ensure configuration is correct
4. **Use in CI/CD**: Automate smoke tests in your pipeline
5. **Fix failures immediately**: Don't proceed if smoke tests fail

