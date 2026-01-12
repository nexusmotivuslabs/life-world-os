# Unified Configuration Guide

**Last Updated**: 2025-01-25  
**Version**: V2 (1.1.0)

## Overview

All environments (local, dev, staging, prod) now use the **same configuration structure** with environment-specific variables. This ensures consistency and makes it easy to manage configurations across environments.

## Configuration Structure

All environments use the same variable naming pattern with environment-specific prefixes:

- **Local**: Standard `DATABASE_URL`, `PORT`, etc. (no prefix)
- **Dev**: `DEV_*` variables
- **Staging**: `STAGING_*` variables  
- **Prod**: `PROD_*` variables

## Environment Files

Each environment has its own configuration file:

- `apps/backend/.env` - Local development (Homebrew PostgreSQL)
- `.env.dev` - Development environment (Docker)
- `.env.staging` - Staging environment (Docker)
- `.env.prod` - Production environment (Docker/Cloud)

### Creating Environment Files

```bash
# Local development (for apps/backend/.env)
cp config/environments/local.env.example apps/backend/.env

# Docker environments (for project root)
cp config/environments/dev.env.example .env.dev
cp config/environments/staging.env.example .env.staging
cp config/environments/prod.env.example .env.prod

# Edit with your values
nano apps/backend/.env  # For local
nano .env.dev            # For dev
```

## Standard Variables

All environments support the same variable structure:

### Database Configuration
```bash
{ENV}_DB_HOST=localhost
{ENV}_DB_PORT=5433
{ENV}_DB_USER=lifeworld_dev
{ENV}_DB_PASSWORD=password
{ENV}_DB_NAME=lifeworld_dev
{ENV}_DATABASE_URL=postgresql://user:password@host:port/database
{ENV}_DB_CONTAINER_NAME=life-db-{env}
```

### Backend Configuration
```bash
{ENV}_BACKEND_PORT=3001
{ENV}_API_URL=http://localhost:3001
{ENV}_BACKEND_CONTAINER_NAME=life-world-os-backend-{env}
{ENV}_BACKEND_IMAGE_NAME=life-world-os-backend-{env}
```

### Frontend Configuration
```bash
{ENV}_FRONTEND_PORT=5173
{ENV}_FRONTEND_URL=http://localhost:5173
{ENV}_FRONTEND_CONTAINER_NAME=life-world-os-frontend-{env}
{ENV}_FRONTEND_IMAGE_NAME=life-world-os-frontend-{env}
VITE_API_URL={API_URL}
```

### Authentication
```bash
{ENV}_JWT_SECRET=your-secret-min-32-chars
{ENV}_JWT_EXPIRES_IN=7d
JWT_SECRET={same-as-above}
JWT_EXPIRES_IN=7d
```

### AI Services
```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
GROQ_API_KEY=
OPENAI_API_KEY=
```

### Logging
```bash
{ENV}_LOG_LEVEL=debug
LOG_LEVEL=debug
```

## Docker Compose Files

All docker-compose files use the same structure and reference environment variables:

- `docker-compose.dev.yml` - Development
- `docker-compose.staging.yml` - Staging
- `docker-compose.prod.yml` - Production

The compose files automatically use variables from `.env.{environment}` files.

## Usage

### Local Development (Homebrew PostgreSQL)
```bash
# Setup local database
createdb lifeworld_local  # Create database
# Or use: psql -c "CREATE DATABASE lifeworld_local;"

# Copy local environment template
cp config/environments/local.env.example apps/backend/.env

# Edit apps/backend/.env with your local database credentials

# Run migrations and seed
cd apps/backend
npm run migrate
npm run seed:local

# Start development servers
npm run dev  # From root directory
```

### Development (Docker)
```bash
# Load .env.dev and start services
./scripts/deploy-dev.sh
# Or manually:
docker-compose -f docker-compose.dev.yml --profile full up -d
```

### Staging
```bash
# Load .env.staging and start services
./scripts/deploy-staging.sh
# Or manually:
docker-compose -f docker-compose.staging.yml up -d
```

### Production
```bash
# Load .env.prod and start services
./scripts/deploy-prod.sh
# Or manually:
docker-compose -f docker-compose.prod.yml up -d
```

## Seeding Per Environment

V2 includes environment-aware seeding:

```bash
# Local development
cd apps/backend
npm run seed:local

# Dev environment (Docker)
npm run seed:dev

# Staging environment (Docker)
npm run seed:staging

# Production (use with extreme caution - typically disabled)
npm run seed:prod
```

**Note**: Production databases should NOT be seeded automatically. Seeding should only be done during initial setup with explicit approval.

## Benefits

1. **Consistency**: All environments use the same structure
2. **Maintainability**: Change structure once, applies everywhere
3. **Flexibility**: Easy to customize per environment via variables
4. **Documentation**: Clear variable naming makes configuration self-documenting
5. **Cloud-Ready**: Same structure works locally and in cloud (just change variables)

## Migration from Old Configuration

If you have existing `.env.{environment}` files, update them to include the new standardized variables:

1. Compare with `config/environments/{env}.env.example`
2. Add any missing variables
3. Ensure variable names match the standard pattern

## Example: Changing a Port

To change the backend port for staging:

1. Edit `.env.staging`
2. Change `STAGING_BACKEND_PORT=3002` to `STAGING_BACKEND_PORT=3003`
3. Restart services: `docker-compose -f docker-compose.staging.yml restart`

The same change pattern works for all environments!

