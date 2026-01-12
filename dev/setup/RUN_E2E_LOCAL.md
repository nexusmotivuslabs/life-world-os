# Running E2E Tests Locally

Complete guide for running end-to-end tests in the local development environment.

## Quick Start

```bash
# Automated - sets up everything and runs tests
npm run test:e2e:local
```

This script will:
1. ✅ Set up database and environment
2. ✅ Start database (if not running)
3. ✅ Start backend (if not running)
4. ✅ Start frontend (if not running)
5. ✅ Verify all services are healthy
6. ✅ Run E2E tests
7. ✅ Show test results

---

## Prerequisites

1. **Docker** - For database
2. **Node.js** 20+ and npm
3. **Dependencies installed**:
   ```bash
   npm install
   cd apps/backend && npm install && cd ../..
   cd apps/frontend && npm install && cd ../..
   ```

---

## Manual Setup (If Needed)

### 1. Setup Database

```bash
# Run setup script
./scripts/setup-local-db.sh

# Or manually
npm run dev:db
```

### 2. Start Services

**Option A: All together**
```bash
npm run dev:local
```

**Option B: Separately (3 terminals)**

Terminal 1 - Database:
```bash
npm run dev:db
```

Terminal 2 - Backend:
```bash
npm run dev:backend
```

Terminal 3 - Frontend:
```bash
npm run dev:frontend
```

### 3. Verify Services

```bash
# Check database
docker-compose -f docker-compose.dev.yml ps postgres-dev

# Check backend
curl http://localhost:5001/api/health

# Check frontend
curl http://localhost:5173
```

---

## Running Tests

### Automated (Recommended)

```bash
npm run test:e2e:local
```

This handles everything automatically.

### Manual

If services are already running:

```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/critical-flows.spec.ts

# Run specific test
npx playwright test -g "should load home page"
```

---

## Test Configuration

### Environment

Tests are configured for **local environment**:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001
- **Database**: localhost:5433

### Test Files

- **Location**: `tests/e2e/`
- **Main test file**: `critical-flows.spec.ts`
- **Config**: `playwright.config.ts`

### Test Coverage

Current E2E tests cover:

1. **Home & Navigation**
   - Home page loading
   - Navigation to Choose Plane
   - Breadcrumb highlighting

2. **Systems View**
   - Navigation to Systems/Tiers
   - Tier hierarchy display
   - View mode switching

3. **System Tree & Reality Hierarchy**
   - System tree loading
   - Expand/collapse nodes

4. **Artifacts View**
   - Artifacts page loading
   - Category filtering
   - Search functionality

5. **Plane Labels Design**
   - Styled plane labels display

6. **Backend Health**
   - API health check
   - Database connection status

7. **Responsive Design**
   - Mobile viewport testing

---

## Viewing Test Results

### HTML Report

```bash
npm run test:e2e:report
```

This opens the Playwright HTML report in your browser.

### Test Output

Tests show results in the terminal:
- ✅ Green checkmarks for passing tests
- ❌ Red X for failing tests
- Screenshots saved for failures (in `test-results/`)

---

## Troubleshooting

### Tests Fail to Start

**Problem**: "Services not ready"

**Solutions**:
1. Check if services are running:
   ```bash
   # Database
   docker-compose -f docker-compose.dev.yml ps postgres-dev
   
   # Backend
   curl http://localhost:5001/api/health
   
   # Frontend
   curl http://localhost:5173
   ```

2. Start services manually:
   ```bash
   npm run dev:local
   ```

3. Wait for services to be ready (can take 30-60 seconds)

### Backend Not Responding

**Problem**: Backend health check fails

**Solutions**:
1. Check backend logs:
   ```bash
   # If running in background
   tail -f /tmp/life-world-backend.log
   
   # Or check terminal where backend is running
   ```

2. Verify database is running:
   ```bash
   npm run dev:db:logs
   ```

3. Check environment variables:
   ```bash
   cat apps/backend/.env.local
   ```

4. Restart backend:
   ```bash
   # Kill existing process
   lsof -ti:5001 | xargs kill -9
   
   # Start again
   npm run dev:backend
   ```

### Frontend Not Responding

**Problem**: Frontend not accessible

**Solutions**:
1. Check frontend logs:
   ```bash
   tail -f /tmp/life-world-frontend.log
   ```

2. Verify port 5173 is available:
   ```bash
   lsof -i:5173
   ```

3. Restart frontend:
   ```bash
   # Kill existing process
   lsof -ti:5173 | xargs kill -9
   
   # Start again
   npm run dev:frontend
   ```

### Database Connection Issues

**Problem**: Database health check fails

**Solutions**:
1. Check database is running:
   ```bash
   docker-compose -f docker-compose.dev.yml ps postgres-dev
   ```

2. Check database logs:
   ```bash
   npm run dev:db:logs
   ```

3. Restart database:
   ```bash
   npm run dev:db:down
   npm run dev:db
   ```

4. Verify connection string in `apps/backend/.env.local`:
   ```env
   DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
   ```

### Test Timeouts

**Problem**: Tests timeout waiting for elements

**Solutions**:
1. Increase timeout in `playwright.config.ts`:
   ```typescript
   timeout: 60 * 1000, // Increase from 30s to 60s
   ```

2. Check if frontend is slow to load:
   ```bash
   # Test manually
   curl http://localhost:5173
   ```

3. Check browser console for errors:
   - Run tests with UI: `npm run test:e2e:ui`
   - Check browser console in Playwright UI

### Port Conflicts

**Problem**: Port already in use

**Solutions**:
1. Find process using port:
   ```bash
   # Backend (5001)
   lsof -i:5001
   
   # Frontend (5173)
   lsof -i:5173
   ```

2. Kill process:
   ```bash
   lsof -ti:5001 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

3. Or change ports in environment files

---

## Test Development

### Writing New Tests

1. **Add to existing test file**:
   ```typescript
   // tests/e2e/critical-flows.spec.ts
   test.describe('New Feature', () => {
     test('should do something', async ({ page }) => {
       await page.goto('/');
       // Your test code
     });
   });
   ```

2. **Or create new test file**:
   ```typescript
   // tests/e2e/new-feature.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('New Feature', () => {
     test('should work', async ({ page }) => {
       await page.goto('/');
       // Test code
     });
   });
   ```

### Best Practices

1. **Use descriptive test names**: "should load home page" not "test1"
2. **Use page object pattern** for complex flows
3. **Wait for elements**: Use `await expect(page.locator(...)).toBeVisible()`
4. **Clean up**: Tests should be independent and not rely on previous tests
5. **Use data-testid**: Add `data-testid` attributes to important elements

### Debugging Tests

1. **Run with UI**:
   ```bash
   npm run test:e2e:ui
   ```

2. **Run in headed mode**:
   ```bash
   npx playwright test --headed
   ```

3. **Run in debug mode**:
   ```bash
   npx playwright test --debug
   ```

4. **Add breakpoints**:
   ```typescript
   await page.pause(); // Pauses execution
   ```

---

## CI/CD Integration

### GitHub Actions

Tests can be run in CI/CD pipelines. The `playwright.config.ts` is configured to:
- Run in headless mode in CI
- Retry failed tests (2 retries)
- Generate HTML reports
- Take screenshots on failure

### Environment Variables

For CI/CD, set:
```bash
CI=true
BACKEND_URL=http://localhost:5001
```

---

## Summary

### Quick Commands

```bash
# Setup and run (recommended)
npm run test:e2e:local

# Run tests (services must be running)
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# View report
npm run test:e2e:report
```

### Service URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health
- **Database**: localhost:5433

### Test Results

- **HTML Report**: `npm run test:e2e:report`
- **Screenshots**: `test-results/` (on failure)
- **Traces**: `test-results/` (on retry)

---

✅ **You're ready to run E2E tests locally!**

For issues, check the troubleshooting section or review service logs.

