# Versioning System - Summary

**Date**: 2025-01-15  
**Status**: ✅ Complete

---

## What Was Created

### Version Scripts
- ✅ `scripts/get-version.sh` - Bash script to get version info
- ✅ `scripts/get-version.js` - Node.js script to get version info (recommended)

### Deployment Scripts (Updated)
- ✅ `scripts/deploy-staging.sh` - Now includes version tagging
- ✅ `scripts/deploy-prod.sh` - New production deployment with versioning
- ✅ `scripts/deploy-cloud.sh` - Updated to include version info

### Dockerfiles (Updated)
- ✅ `apps/backend/Dockerfile.staging` - Accepts version build args
- ✅ `apps/backend/Dockerfile.prod` - Accepts version build args
- ✅ `apps/frontend/Dockerfile.staging` - Accepts version build args
- ✅ `apps/frontend/Dockerfile.prod` - Accepts version build args

### Docker Compose (Updated)
- ✅ `docker-compose.staging.yml` - Uses version tags for images

### Backend (Updated)
- ✅ `apps/backend/src/routes/health.ts` - Added `/api/health` endpoint with version info

### Documentation
- ✅ `DEPLOYMENT_VERSIONING.md` - Complete versioning guide
- ✅ `VERSIONING_SUMMARY.md` - This file

### Package.json (Updated)
- ✅ Added `version:get`, `version:staging`, `version:prod` scripts
- ✅ Added `prod:deploy` script

---

## How It Works

### Version Format

**Production**:
- Format: `main-<commit-hash>` or `<tag>` (if latest tag exists)
- Example: `main-a1b2c3d` or `v1.2.3`
- Source: Latest commit on `main` branch

**Staging**:
- Format: `staging-<commit-hash>`
- Example: `staging-e4f5g6h`
- Source: Latest commit on `staging` branch

**Development**:
- Format: `<branch>-<commit-hash>`
- Example: `feature-auth-x7y8z9a`
- Source: Current branch and commit

### Version Information Includes

- **Version**: Version tag (e.g., `staging-a1b2c3d`)
- **Commit**: Short commit hash
- **Full Commit**: Full commit hash
- **Branch**: Git branch name
- **Tag**: Latest git tag (if any)
- **Commit Message**: First line of commit message
- **Commit Timestamp**: Unix timestamp of commit
- **Build Timestamp**: When the image was built

---

## Usage

### Get Version Info

```bash
# Get version for current environment
npm run version:get

# Get version for staging
npm run version:staging

# Get version for production
npm run version:prod
```

### Deploy with Versioning

```bash
# Staging (automatically tags with version)
npm run staging:deploy
# or
./scripts/deploy-staging.sh

# Production (requires main branch, shows version)
npm run prod:deploy
# or
./scripts/deploy-prod.sh
```

### Check Running Version

```bash
# Staging
curl http://localhost:3002/health | jq .version

# Production
curl http://localhost:3000/health | jq .version
```

### Health Endpoint Response

```json
{
  "status": "ok",
  "version": {
    "version": "staging-a1b2c3d",
    "commit": "a1b2c3d",
    "fullCommit": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    "branch": "staging",
    "tag": null,
    "commitMessage": "Add version tracking",
    "commitTimestamp": 1705320000,
    "buildTimestamp": "2025-01-15T12:00:00Z",
    "environment": "staging"
  },
  "database": {
    "status": "connected"
  },
  "uptime": 3600
}
```

---

## Docker Images

Images are tagged with version:
- `life-world-os-backend-staging:staging-a1b2c3d`
- `life-world-os-backend-prod:main-e4f5g6h`
- `life-world-os-frontend-staging:staging-a1b2c3d`
- `life-world-os-frontend-prod:main-e4f5g6h`

---

## Environment Variables

Version information is available in containers:
- `BUILD_VERSION`: Version tag
- `BUILD_COMMIT`: Short commit hash
- `BUILD_BRANCH`: Git branch name
- `BUILD_TIMESTAMP`: Build timestamp (ISO 8601)

---

## Benefits

✅ **Track Deployments**: Know exactly what's running in each environment  
✅ **Debug Issues**: Identify which commit caused problems  
✅ **Rollback**: Easily rollback to specific versions  
✅ **Audit Trail**: Track all deployments with version info  
✅ **Health Checks**: Version info available via health endpoint  

---

## Next Steps

1. ✅ Deploy to staging and verify version appears
2. ✅ Check health endpoint shows version
3. ✅ Tag production releases with git tags
4. ✅ Track deployments in deployment log

---

**Maintained By**: Atlas (DevOps Engineer)  
**See Also**: [DEPLOYMENT_VERSIONING.md](./DEPLOYMENT_VERSIONING.md) for detailed guide

