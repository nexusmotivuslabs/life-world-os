# Deployment Versioning

**Last Updated**: 2025-01-15  
**Maintained By**: Atlas (DevOps Engineer)

---

## Overview

All deployments are tagged with version information to track what's running in each environment. This allows you to:

- Track which commit is deployed in each environment
- Identify what version is running in production vs staging
- Debug issues by knowing exactly what code is deployed
- Rollback to specific versions if needed

---

## Version Format

### Production
- **Format**: `main-<commit-hash>` or `<tag>` (if latest tag exists)
- **Example**: `main-a1b2c3d` or `v1.2.3`
- **Source**: Latest commit on `main` branch

### Staging
- **Format**: `staging-<commit-hash>`
- **Example**: `staging-e4f5g6h`
- **Source**: Latest commit on `staging` branch

### Development
- **Format**: `<branch>-<commit-hash>`
- **Example**: `feature-auth-x7y8z9a`
- **Source**: Current branch and commit

---

## Version Information

Each deployment includes:

- **Version**: Version tag (e.g., `staging-a1b2c3d`)
- **Commit**: Short commit hash (e.g., `a1b2c3d`)
- **Full Commit**: Full commit hash (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`)
- **Branch**: Git branch name
- **Tag**: Latest git tag (if any)
- **Commit Message**: First line of commit message
- **Commit Timestamp**: Unix timestamp of commit
- **Build Timestamp**: When the image was built

---

## How It Works

### 1. Version Script

The `scripts/get-version.js` script extracts version information from git:

```bash
# Get version for staging
node scripts/get-version.js staging

# Get version for production
node scripts/get-version.js prod

# Get version for current environment
node scripts/get-version.js dev
```

### 2. Deployment Scripts

Deployment scripts automatically:
1. Get version information
2. Tag Docker images with version
3. Set environment variables in containers
4. Display version in deployment output

### 3. Docker Images

Docker images are tagged with version:
- `life-world-os-backend-staging:staging-a1b2c3d`
- `life-world-os-backend-prod:main-e4f5g6h`

### 4. Health Endpoint

Version information is available via health endpoint:

```bash
# Check version in staging
curl http://localhost:3002/health

# Check version in production
curl http://localhost:3000/health
```

Response:
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

## Usage

### Staging Deployment

```bash
# Deploy to staging (automatically tags with version)
./scripts/deploy-staging.sh

# Output shows version:
# Version: staging-a1b2c3d
# Commit: a1b2c3d
# Branch: staging
```

### Production Deployment

```bash
# Deploy to production (requires main branch)
./scripts/deploy-prod.sh

# Output shows version:
# Version: main-e4f5g6h
# Commit: e4f5g6h
# Branch: main
# Tag: v1.2.3 (if exists)
```

### Check Running Version

```bash
# Staging
curl http://localhost:3002/health | jq .version

# Production
curl http://localhost:3000/health | jq .version
```

### List Docker Images

```bash
# List all staging images
docker images | grep life-world-os-backend-staging

# List all production images
docker images | grep life-world-os-backend-prod
```

---

## Docker Compose

### Staging

```yaml
services:
  backend-staging:
    build:
      args:
        BUILD_VERSION: ${BUILD_VERSION:-staging-unknown}
        BUILD_COMMIT: ${BUILD_COMMIT:-unknown}
        BUILD_BRANCH: ${BUILD_BRANCH:-unknown}
        BUILD_TIMESTAMP: ${BUILD_TIMESTAMP:-unknown}
    image: life-world-os-backend-staging:${BUILD_VERSION:-latest}
```

### Production

```yaml
services:
  backend-prod:
    build:
      args:
        BUILD_VERSION: ${BUILD_VERSION:-prod-unknown}
        BUILD_COMMIT: ${BUILD_COMMIT:-unknown}
        BUILD_BRANCH: ${BUILD_BRANCH:-unknown}
        BUILD_TIMESTAMP: ${BUILD_TIMESTAMP:-unknown}
    image: life-world-os-backend-prod:${BUILD_VERSION:-latest}
```

---

## Environment Variables

Version information is available in containers via environment variables:

- `BUILD_VERSION`: Version tag (e.g., `staging-a1b2c3d`)
- `BUILD_COMMIT`: Short commit hash
- `BUILD_BRANCH`: Git branch name
- `BUILD_TIMESTAMP`: Build timestamp (ISO 8601)

These are set at build time and available at runtime.

---

## Best Practices

### 1. Always Tag Production Deployments

```bash
# Before deploying to production, create a tag
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Then deploy
./scripts/deploy-prod.sh
```

### 2. Check Version After Deployment

```bash
# Always verify version after deployment
curl http://localhost:3000/health | jq .version
```

### 3. Track Deployments

Keep a deployment log:
- Date/time
- Version
- Commit hash
- Who deployed
- Any issues

### 4. Use Version for Rollbacks

```bash
# Rollback to specific version
docker-compose -f docker-compose.prod.yml up -d \
  --image life-world-os-backend-prod:main-abc123
```

---

## Troubleshooting

### Version Shows "unknown"

**Cause**: Git repository not available or script can't access git

**Solution**:
```bash
# Ensure you're in a git repository
git status

# Ensure git is installed
git --version

# Check script permissions
chmod +x scripts/get-version.js
```

### Wrong Branch for Production

**Cause**: Deploying from non-main branch

**Solution**:
```bash
# Switch to main branch
git checkout main
git pull origin main

# Then deploy
./scripts/deploy-prod.sh
```

### Version Not in Health Endpoint

**Cause**: Environment variables not set in container

**Solution**:
```bash
# Check Dockerfile has ARG and ENV
# Check docker-compose.yml passes build args
# Rebuild image
docker-compose build --no-cache
```

---

## Related Documentation

- [Docker Environment Setup](./DOCKER_ENVIRONMENT_SETUP.md)
- [Platform Decision Framework](./docs/confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md)

---

**Maintained By**: Atlas (DevOps Engineer)

