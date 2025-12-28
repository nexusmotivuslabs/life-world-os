# V1 to V2 Migration Guide

**From**: V1.0.0  
**To**: V2 (1.1.0)  
**Last Updated**: 2025-01-25

## Overview

V2 introduces environment-aware deployments, enhanced seeding capabilities, and improved configuration management. This guide helps you migrate from V1 to V2.

## What Changed

### Version Numbers
- **V1**: 1.0.0 (tagged as `v1.0.0`)
- **V2**: 1.1.0 (current development version)

### New Features
1. **Environment-Aware Seeding**: Seeding scripts that work with local, dev, staging, and prod
2. **Enhanced Deployment Scripts**: Improved deployment scripts for all environments
3. **Local Environment Support**: Native support for Homebrew PostgreSQL
4. **Version Management**: Enhanced version tracking with V1/V2 distinction
5. **Configuration Templates**: Standardized environment configuration templates

### Breaking Changes
**None** - V2 is backward compatible with V1.

## Migration Steps

### 1. Update Dependencies

```bash
# Pull latest changes
git pull origin main

# Install/update dependencies
npm install
```

### 2. Version Tags

**Versioning is git-tag-only**. No need to update package.json versions.

Create git tag for V2:
```bash
git tag -a v1.1.0 -m "V2 Release: Environment-aware deployments"
git push origin v1.1.0
```

The version scripts will automatically detect and use this tag.

### 3. Environment Configuration

#### Local Development

If you're using local development with Homebrew PostgreSQL:

```bash
# Create local environment file
cp config/environments/local.env.example apps/backend/.env

# Update DATABASE_URL in apps/backend/.env
# Example:
DATABASE_URL=postgresql://lifeworld:lifeworld_local@localhost:5432/lifeworld_local
```

#### Docker Environments

Existing `.env.dev`, `.env.staging`, and `.env.prod` files should continue to work. However, you may want to update them to match the new templates:

```bash
# Compare with new templates
diff .env.dev config/environments/dev.env.example
diff .env.staging config/environments/staging.env.example
diff .env.prod config/environments/prod.env.example

# Update if needed
```

### 4. Database Migrations

No schema changes in V2. Existing databases should work without migration.

However, if you want to ensure everything is up to date:

```bash
# Local
cd apps/backend
npm run migrate

# Dev (Docker)
docker exec life-world-os-backend-dev npx prisma migrate deploy

# Staging (Docker)
docker exec life-world-os-backend-staging npx prisma migrate deploy

# Prod (Docker)
docker exec life-world-os-backend-prod npx prisma migrate deploy
```

### 5. Seeding

V2 introduces environment-aware seeding. You can now seed specific environments:

```bash
# Local
cd apps/backend
npm run seed:local

# Dev (Docker)
docker exec life-world-os-backend-dev npm run seed:dev

# Staging (Docker)
docker exec life-world-os-backend-staging npm run seed:staging
```

**Note**: Production seeding remains disabled for safety.

### 6. Deployment Scripts

New deployment scripts are available:

```bash
# Dev deployment
./scripts/deploy-dev.sh

# Staging deployment (updated)
./scripts/deploy-staging.sh

# Production deployment (updated)
./scripts/deploy-prod.sh
```

Existing deployment processes should continue to work, but you may want to use the new scripts for enhanced features.

### 7. Version Tracking

Version information now includes V1/V2 distinction:

```bash
# Check version info
npm run version:get

# Output includes:
# - packageVersion: "1.1.0"
# - isV1: false
# - isV2: true
# - releaseVersion: "v2"
```

## Rollback Procedures

If you need to rollback to V1:

### 1. Git Tag

```bash
# Checkout V1 tag
git checkout v1.0.0

# Or create a branch from V1
git checkout -b rollback-v1 v1.0.0
```

### 2. Restore Versions

If you've already updated to V2 and need to rollback:

```bash
# Update package.json versions back to 1.0.0
# In package.json, apps/backend/package.json, apps/frontend/package.json
"version": "1.0.0"
```

### 3. Database

No database rollback needed - V2 is backward compatible with V1 database schema.

### 4. Environment Files

Your existing `.env` files should continue to work. No changes needed.

## Verification

After migration, verify everything works:

### 1. Health Checks

```bash
# Local
curl http://localhost:3001/health

# Dev
curl http://localhost:3001/health

# Staging
curl http://localhost:3002/health

# Prod
curl http://localhost:3000/health
```

Health endpoint should show:
- Version: 1.1.0 (or current version)
- Environment: correct environment
- Status: healthy

### 2. Database Connection

```bash
# Test database connection
cd apps/backend
npm run studio  # Opens Prisma Studio
```

### 3. Seeding

```bash
# Test seeding (local)
cd apps/backend
npm run seed:local
```

### 4. Frontend

```bash
# Start frontend
npm run dev:frontend

# Access http://localhost:5173
# Verify all features work
```

## Common Issues

### Issue: "Unknown environment" error

**Solution**: Ensure you're using the correct environment name:
- `local` (for apps/backend/.env)
- `dev` (for .env.dev)
- `staging` (for .env.staging)
- `prod` (for .env.prod)

### Issue: Database connection fails

**Solution**: 
1. Verify DATABASE_URL is correct
2. Check database is running
3. Verify credentials match

### Issue: Seeding fails

**Solution**:
1. Ensure database is accessible
2. Check DATABASE_URL is set correctly
3. Verify migrations are up to date
4. Check seed script has correct permissions

### Issue: Version shows as V1

**Solution**: 
1. Verify package.json version is 1.1.0
2. Check git tag v1.0.0 exists
3. Restart services to pick up new version

## Post-Migration Checklist

- [ ] Version updated to 1.1.0
- [ ] Environment files configured
- [ ] Database migrations applied
- [ ] Seeding works for local/dev/staging
- [ ] Health checks pass
- [ ] Frontend loads correctly
- [ ] All features functional
- [ ] Deployment scripts tested
- [ ] Documentation reviewed

## Support

If you encounter issues during migration:

1. Check this guide
2. Review [DEPLOYMENT_V2.md](./DEPLOYMENT_V2.md)
3. Check [CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md)
4. Review error logs
5. Check health endpoints

## Related Documentation

- [DEPLOYMENT_V2.md](./DEPLOYMENT_V2.md) - V2 deployment guide
- [V1_COMPLETE.md](../V1_COMPLETE.md) - V1 completion documentation
- [CHANGELOG.md](../CHANGELOG.md) - Version changelog
- [CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md) - Configuration reference

