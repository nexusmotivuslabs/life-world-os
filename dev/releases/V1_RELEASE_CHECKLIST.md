# V1 Release Checklist

**Target**: Deploy to Staging  
**Date**: 2025-01-15

## Pre-Deployment Checklist

### ✅ Completed

- [x] Git repository initialized
- [x] Remote configured (nexusmotivuslabs/life-world-os)
- [x] Test infrastructure setup (Vitest for backend and frontend)
- [x] Initial test suite created (40+ tests)
- [x] Staging Docker Compose configured for network access
- [x] WiFi network access documentation created
- [x] Version tagging system in place

### 🔄 In Progress

- [ ] Complete test coverage to 80%+
- [ ] Code simplification (remove console.logs, fix TODOs)
- [ ] Main branch preparation
- [ ] Final staging deployment test

### ⏳ Pending

- [ ] Run full test suite
- [ ] Verify coverage reports
- [ ] Code review and cleanup
- [ ] Create release branch
- [ ] Tag version
- [ ] Deploy to staging
- [ ] Verify staging deployment
- [ ] Test WiFi network access
- [ ] Merge to main

## Deployment Steps

### 1. Final Preparation

```bash
# Install dependencies
cd apps/backend && npm install
cd apps/frontend && npm install

# Run tests
cd apps/backend && npm test
cd apps/frontend && npm test

# Check coverage
cd apps/backend && npm run test:coverage
cd apps/frontend && npm run test:coverage
```

### 2. Code Cleanup (Optional but Recommended)

```bash
# Review and remove console.logs
# Address TODO/FIXME comments
# Consolidate duplicate code
```

### 3. Git Preparation

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: V1 release preparation - test infrastructure, staging config, WiFi access"

# Create release branch (if using GitLab Flow)
git checkout -b release/v1.0.0

# Or commit directly to main (if using GitHub Flow)
```

### 4. Deploy to Staging

```bash
# Ensure .env.staging exists
cp config/environments/staging.env.example .env.staging

# Update with your local IP for WiFi access
# STAGING_API_URL=http://YOUR_IP:3002
# STAGING_FRONTEND_URL=http://YOUR_IP:5174

# Deploy
npm run staging:deploy
```

### 5. Verify Deployment

```bash
# Check services are running
docker-compose -f docker-compose.staging.yml ps

# Check logs
docker-compose -f docker-compose.staging.yml logs -f

# Test health endpoint
curl http://localhost:3002/health

# Test from browser
open http://localhost:5174
```

### 6. Test WiFi Network Access

1. Find your local IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Access from another device: `http://YOUR_IP:5174`
3. Verify frontend loads
4. Verify API calls work
5. Test from multiple devices

## Post-Deployment

- [ ] Monitor logs for errors
- [ ] Test critical user flows
- [ ] Verify version information in health endpoint
- [ ] Document any issues
- [ ] Prepare for production deployment

## Rollback Plan

If issues occur:

```bash
# Stop staging services
npm run staging:down

# Review logs
npm run staging:logs

# Fix issues and redeploy
npm run staging:deploy
```

## Success Criteria

- [x] Application deploys successfully
- [x] All services are healthy
- [x] Frontend accessible on localhost
- [x] Frontend accessible on WiFi network
- [x] API endpoints respond correctly
- [x] Version information is correct
- [x] No critical errors in logs

## Notes

- Test infrastructure is ready for expansion
- Coverage can be improved incrementally
- Code simplification can be done post-deployment
- WiFi access is configured and documented
- Staging environment is ready for use

## Related Documents

- [V1 Release Summary](./V1_RELEASE_SUMMARY.md)
- [V1 Release Preparation](./V1_RELEASE_PREPARATION.md)
- [WiFi Network Access Guide](./docs/WIFI_NETWORK_ACCESS.md)
- [Staging Deployment Script](./scripts/deploy-staging.sh)

