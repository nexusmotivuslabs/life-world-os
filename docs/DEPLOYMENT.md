# Deployment Guide

**Last Updated**: 2025-02-24  
**Maintained By**: Atlas (DevOps Engineer)

---

## Pre-deployment checklist

Before deploying (staging or production):

1. **Tests and coverage**
   - From repo root: `npm run test` (runs backend + frontend unit tests)
   - Coverage: `npm run test:coverage` — enforces **85%** lines/statements on critical areas (config, core services, choose-plane, blogs, navigation, utils)
   - E2E (optional): `npm run test:e2e` (requires app and backend running)

2. **Environment**
   - Main app: `.env.staging` / `.env.prod` with `DATABASE_URL`, `JWT_SECRET`, `STAGING_API_URL` / `PROD_API_URL`, etc. See `config/environments/` and compose files.
   - RIE (Reality Intelligence): if you run the RIE backend, set `FRED_API_KEY` in `apps/rie-backend/.env`. See `apps/rie-backend/API_KEYS.md`.

3. **Build**
   - `npm run build` (backend + frontend). For staging/prod images, use the Dockerfiles in `apps/backend` and `apps/frontend` (e.g. `Dockerfile.staging`, `Dockerfile.prod`).

4. **Health**
   - Backend: `GET /health` (or `/api/health`). Frontend: static or nginx health route if configured.

---

## Overview

Life World OS supports multiple deployment strategies from local development to cloud production. This guide covers all deployment options and environments.

---

## Deployment Phases

### MVP: In-Home WiFi Access (Local Deployment)

**Cost**: $0/month | **Time**: 5 minutes

**Infrastructure**: Local machine only

**Quick Start (with full data – recommended)**:
```bash
# One command: DB, backend, frontend, and seed (Local Lite)
./scripts/envs/local-lite.sh
```
- Frontend: http://localhost:5002 (or 5173)
- Backend: http://localhost:5001
- Database: localhost:5433  
- Seed runs automatically so hierarchy, laws, and artifacts are available. Log in (e.g. test@example.com / password123). See [RUNBOOKS.md](./RUNBOOKS.md#start-application-with-full-data).

**Alternative (database + dev servers)**:
```bash
npm run verify
cp config/environments/dev.env.example .env.dev
npm install
npm run dev:db && npm run dev
# Then in another terminal: cd apps/backend && npm run seed
```

**Access (alternative)**: 
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5433

**Caching**: PostgreSQL cache only (sufficient for MVP)

See [MVP Deployment Guide](./MVP_DEPLOYMENT_GUIDE.md) for detailed guide.

---

### Staging: Testing Environment

**Cost**: Varies by provider | **Purpose**: Testing and QA

**Quick Start**:
```bash
# Deploy to staging
npm run staging:deploy
# or
./scripts/deploy-staging.sh
```

**Access**:
- Frontend: http://localhost:5174
- Backend: http://localhost:3002
- Health Check: http://localhost:3002/health

**Environment Variables**:
- `STAGING_DB_PASSWORD` - Database password
- `STAGING_JWT_SECRET` - JWT secret (min 32 characters)
- `STAGING_API_URL` - Backend API URL

---

### Release 3: AWS Public Deployment

**Cost**: $7-26/month | **Setup**: See deployment strategy

**Infrastructure**: AWS Tier 2 services
- VPC (Network Isolation) - FREE
- ECS Fargate (Container hosting) - ~$5-10/month per service
- RDS PostgreSQL (Database) - $0-15/month
- ElastiCache Redis (Optional caching) - ~$13/month

**Deployment**:
```bash
# See deployment strategy
./docs/confluence/domains/platform-engineering/implementation/deployment-strategy.md
```

See [Deployment Strategy](./confluence/domains/platform-engineering/implementation/deployment-strategy.md) for detailed AWS setup.

---

## Render + Supabase (recommended free tier)

**Cost**: $0 (free tiers) | **Database**: Supabase (no 90-day expiration) | **Hosting**: Render

See **[RENDER_SUPABASE_DEPLOYMENT.md](./RENDER_SUPABASE_DEPLOYMENT.md)** for step-by-step setup. Summary: Supabase for PostgreSQL, Render Web Service for backend, Render Static Site for frontend. A `render.yaml` blueprint is in the repo root.

---

## Multi-Cloud Support

The application can be deployed to any cloud provider:

- ✅ **AWS** - Amazon Web Services
- ✅ **GCP** - Google Cloud Platform
- ✅ **Azure** - Microsoft Azure
- ✅ **DigitalOcean** - DigitalOcean
- ✅ **Railway** - Railway
- ✅ **Render** - Render
- ✅ **Docker** - Self-hosted

### Cloud Deployment

```bash
# Docker (local/self-hosted)
./scripts/deploy-cloud.sh staging docker

# Cloud providers
./scripts/deploy-cloud.sh staging aws
./scripts/deploy-cloud.sh staging gcp
./scripts/deploy-cloud.sh staging azure
./scripts/deploy-cloud.sh staging digitalocean
```

---

## Environment Configuration

### Development
- **Database**: Local PostgreSQL (Docker)
- **Backend**: Local (port 3001)
- **Frontend**: Local (port 5173)
- **Config**: `.env.dev`

### Staging
- **Database**: Managed or containerized
- **Backend**: Cloud service (port 3002)
- **Frontend**: CDN-hosted (port 5174)
- **Config**: `config/environments/staging.env`

### Production
- **Database**: Managed (RDS, Cloud SQL, etc.)
- **Backend**: Auto-scaling service
- **Frontend**: CDN with caching
- **Config**: `config/environments/prod.env`

---

## Version Tagging

All deployments are tagged with version information. See [Git Workflow](./GIT_WORKFLOW.md#deployment-versioning) for details.

**Check Version**:
```bash
# Staging
curl http://localhost:3002/health | jq .version

# Production
curl http://localhost:3000/health | jq .version
```

---

## Docker Compose Files

- `docker-compose.dev.yml` - Development environment
- `docker-compose.staging.yml` - Staging environment
- `docker-compose.prod.yml` - Production reference

---

## Deployment Scripts

- `scripts/deploy-cloud.sh` - Multi-cloud deployment
- `scripts/deploy-staging.sh` - Staging deployment
- `scripts/deploy-prod.sh` - Production deployment

---

## Health Checks

All environments expose health endpoints:

```bash
# Development
curl http://localhost:3001/health

# Staging
curl http://localhost:3002/health

# Production
curl http://localhost:3000/health
```

Response includes:
- Status
- Version information
- Database connection status
- Uptime

---

## Troubleshooting

### Database Connection Issues

```bash
# Check database is running
docker-compose ps

# Check database logs
docker-compose logs postgres-dev

# Restart database
docker-compose restart postgres-dev
```

### Port Conflicts

```bash
# Check what's using the port
lsof -i :3001
lsof -i :5173

# Change ports in docker-compose.yml or .env
```

### Environment Variables

```bash
# Verify environment variables are set
cat .env.dev
cat config/environments/staging.env

# Check variables in container
docker exec <container> env | grep DATABASE
```

---

## Related Documents

- [MVP Deployment Guide](./MVP_DEPLOYMENT_GUIDE.md)
- [Docker Environment Setup](../DOCKER_ENVIRONMENT_SETUP.md)
- [Deployment Strategy](./confluence/domains/platform-engineering/implementation/deployment-strategy.md)
- [Git Workflow](./GIT_WORKFLOW.md)
- [Platform Engineering Domain](./confluence/domains/platform-engineering/README.md)

---

**Maintained By**: Atlas (DevOps Engineer)  
**Review Cycle**: Quarterly





