# V2 Deployment Guide

**Version**: 1.1.0 (V2)  
**Last Updated**: 2025-01-25

## Overview

V2 (version 1.1.0) introduces environment-aware deployments with comprehensive configuration for local, dev, staging, and prod environments. This guide covers deployment processes for all environments.

## Prerequisites

- Node.js 20+
- npm 9+
- Docker and Docker Compose (for dev, staging, prod)
- PostgreSQL (Homebrew or Docker)
- Git

See [PREREQUISITES.md](../PREREQUISITES.md) for detailed requirements.

## Environment Overview

| Environment | Purpose | Database | Seeding | Ports |
|------------|---------|----------|---------|-------|
| **Local** | Local development | Homebrew PostgreSQL | Enabled | 3001, 5173 |
| **Dev** | Development testing | Docker PostgreSQL | Enabled | 3001, 5173 |
| **Staging** | Pre-production testing | Docker PostgreSQL | Enabled | 3002, 5174 |
| **Prod** | Production | Managed/Cloud DB | Disabled | 3000, 80/443 |

## Local Development Setup

### 1. Database Setup

#### Option A: Homebrew PostgreSQL (Recommended)
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb lifeworld_local

# Or using psql
psql postgres -c "CREATE DATABASE lifeworld_local;"
```

#### Option B: Docker PostgreSQL
```bash
# Start PostgreSQL container
docker-compose -f docker-compose.dev.yml --profile db up -d postgres-dev
```

### 2. Environment Configuration

```bash
# Copy local environment template
cp config/environments/local.env.example apps/backend/.env

# Edit apps/backend/.env with your database credentials
nano apps/backend/.env
```

**Key variables for local:**
```env
DATABASE_URL=postgresql://lifeworld:lifeworld_local@localhost:5432/lifeworld_local
PORT=3001
JWT_SECRET=local-jwt-secret-change-in-production-min-32-chars
```

### 3. Database Setup

```bash
cd apps/backend

# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed database
npm run seed:local
```

### 4. Start Development Servers

```bash
# From project root
npm run dev

# Or separately:
npm run dev:backend  # Backend on :3001
npm run dev:frontend # Frontend on :5173
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health: http://localhost:3001/health

## Dev Environment Deployment

### 1. Environment Configuration

```bash
# Copy dev environment template
cp config/environments/dev.env.example .env.dev

# Edit with your values
nano .env.dev
```

### 2. Deploy

```bash
# Automated deployment
./scripts/deploy-dev.sh

# Or manually:
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Database Setup

```bash
# Migrations run automatically during deployment
# Seeding runs automatically during deployment

# Or manually:
docker exec life-world-os-backend-dev npx prisma migrate deploy
docker exec life-world-os-backend-dev npm run seed:dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5433
- Health: http://localhost:3001/health

## Staging Environment Deployment

### 1. Environment Configuration

```bash
# Copy staging environment template
cp config/environments/staging.env.example .env.staging

# Edit with your values
nano .env.staging
```

### 2. Deploy

```bash
# Automated deployment
./scripts/deploy-staging.sh

# Or manually:
docker-compose -f docker-compose.staging.yml build
docker-compose -f docker-compose.staging.yml up -d
```

### 3. Database Setup

```bash
# Migrations run automatically during deployment
# Seeding runs automatically during deployment

# Or manually:
docker exec life-world-os-backend-staging npx prisma migrate deploy
docker exec life-world-os-backend-staging npm run seed:staging
```

**Access:**
- Frontend: http://localhost:5174
- Backend: http://localhost:3002
- Database: localhost:5434
- Health: http://localhost:3002/health

## Production Environment Deployment

### 1. Pre-Deployment Checklist

- [ ] On main/master branch
- [ ] All tests passing
- [ ] Staging deployment successful
- [ ] Production database configured
- [ ] Environment variables set
- [ ] Secrets management configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### 2. Environment Configuration

```bash
# Copy production environment template
cp config/environments/prod.env.example .env.prod

# Edit with production values
nano .env.prod

# IMPORTANT: Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
# Never commit .env.prod with real values
```

### 3. Deploy

```bash
# Automated deployment (requires confirmation)
./scripts/deploy-prod.sh

# Or manually:
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Database Setup

```bash
# Migrations run automatically during deployment
# Seeding is DISABLED for production (safety)

# Manual migration (if needed):
docker exec life-world-os-backend-prod npx prisma migrate deploy
```

**Note**: Production databases should NOT be seeded automatically. Seeding should only be done during initial setup with explicit approval.

**Access:**
- Backend: http://localhost:3000 (or configured domain)
- Health: http://localhost:3000/health

## Version Management

### Git Tags (Source of Truth)

**All versioning is git-tag-only**. Version information is derived from git tags, not package.json files.

### Creating Version Tags

```bash
# Create annotated tag for release
git tag -a v1.1.0 -m "V2 Release: Environment-aware deployments"

# Push tag to remote
git push origin v1.1.0
```

See [GIT_TAGGING_GUIDE.md](./GIT_TAGGING_GUIDE.md) for complete tagging guide.

### Checking Version

```bash
# Get version info for current environment
npm run version:get

# Get version for specific environment
npm run version:staging
npm run version:prod
```

### Version Information

Version information includes:
- Git tag (source of truth)
- Version extracted from tag (e.g., `1.1.0`)
- Major, minor, patch versions
- Git commit hash
- Git branch
- Build timestamp
- Environment
- V1/V2 release version (derived from tag)

## Seeding Strategy

### When to Seed

| Environment | Seeding | When |
|------------|---------|------|
| **Local** | Enabled | Always (development) |
| **Dev** | Enabled | Always (testing) |
| **Staging** | Enabled | Always (pre-production testing) |
| **Prod** | Disabled | Only during initial setup (manual) |

### Seeding Commands

```bash
# Local
cd apps/backend
npm run seed:local

# Dev (Docker)
docker exec life-world-os-backend-dev npm run seed:dev

# Staging (Docker)
docker exec life-world-os-backend-staging npm run seed:staging

# Prod (use with extreme caution)
docker exec life-world-os-backend-prod npm run seed:prod
```

## Troubleshooting

### Database Connection Issues

```bash
# Check database is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name
```

### Container Issues

```bash
# View logs
docker-compose -f docker-compose.{env}.yml logs -f

# Restart services
docker-compose -f docker-compose.{env}.yml restart

# Stop services
docker-compose -f docker-compose.{env}.yml down

# Clean restart (removes volumes)
docker-compose -f docker-compose.{env}.yml down -v
```

## Environment-Specific Notes

### Local
- Uses Homebrew PostgreSQL (port 5432)
- No Docker required for database
- Fastest development iteration
- Direct file system access

### Dev
- Uses Docker PostgreSQL (port 5433)
- Isolated from local PostgreSQL
- Matches staging/prod structure
- Good for testing Docker deployments

### Staging
- Uses Docker PostgreSQL (port 5434)
- Mirrors production structure
- Used for pre-production testing
- Seeding enabled for test data

### Prod
- Uses managed/cloud database
- No automatic seeding
- Requires explicit approval for changes
- Full monitoring and alerting

## Best Practices

1. **Always test in staging before production**
2. **Use environment-specific .env files**
3. **Never commit .env files with real values**
4. **Use secrets management for production**
5. **Document all environment-specific changes**
6. **Keep deployment scripts up to date**
7. **Monitor health endpoints after deployment**
8. **Have a rollback plan ready**

## Related Documentation

- [V1_TO_V2_MIGRATION.md](./V1_TO_V2_MIGRATION.md) - Migration guide from V1 to V2
- [CONFIGURATION_GUIDE.md](../CONFIGURATION_GUIDE.md) - Configuration reference
- [V1_DEPLOYMENT.md](./V1_DEPLOYMENT.md) - V1 deployment guide
- [PREREQUISITES.md](../PREREQUISITES.md) - Prerequisites and setup

