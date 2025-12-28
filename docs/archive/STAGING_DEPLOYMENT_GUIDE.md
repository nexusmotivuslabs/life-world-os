# Staging/Testing Environment Deployment Guide

**Release:** Release 1  
**Purpose:** Deploy to sample environments for testing and QA

## Overview

This guide explains how to deploy Life World OS to staging/testing environments for simulation and testing purposes. The staging environment is designed to mirror production as closely as possible while being safe for testing.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Access to environment variables and API keys (if needed)

## Quick Start

### 1. Set Up Environment Variables

```bash
# Copy the example file
cp .env.staging.example .env.staging

# Edit with your values
nano .env.staging
```

**Required Variables:**
- `STAGING_DB_PASSWORD` - Database password for staging
- `STAGING_JWT_SECRET` - JWT secret (min 32 characters)
- `STAGING_API_URL` - Backend API URL (default: http://localhost:3002)
- `VITE_API_URL` - Frontend API URL (default: http://localhost:3002)

**Optional Variables:**
- `OLLAMA_URL` - For local LLM (default: http://host.docker.internal:11434)
- `GROQ_API_KEY` - For Groq AI services
- `OPENAI_API_KEY` - For OpenAI services

### 2. Deploy to Staging

```bash
# Make script executable
chmod +x scripts/deploy-staging.sh

# Deploy
./scripts/deploy-staging.sh
```

Or manually:

```bash
# Build and start
docker-compose -f docker-compose.staging.yml up --build -d

# Run migrations
docker exec life-world-os-backend-staging npx prisma migrate deploy

# Seed database (optional)
docker exec life-world-os-backend-staging npm run seed
```

### 3. Access Services

- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:3002
- **Health Check:** http://localhost:3002/health
- **Database:** localhost:5434

## Environment Details

### Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5174 | Staging frontend application |
| Backend | 3002 | Staging backend API |
| Database | 5434 | PostgreSQL database |

### Containers

- `life-world-os-frontend-staging` - Frontend application
- `life-world-os-backend-staging` - Backend API server
- `life-world-os-db-staging` - PostgreSQL database

### Database

- **Database Name:** `lifeworld_staging`
- **Username:** `lifeworld_staging`
- **Password:** Set in `.env.staging` as `STAGING_DB_PASSWORD`
- **Port:** `5434` (external), `5432` (internal)

## Common Operations

### View Logs

```bash
# All services
docker-compose -f docker-compose.staging.yml logs -f

# Specific service
docker-compose -f docker-compose.staging.yml logs -f backend-staging
docker-compose -f docker-compose.staging.yml logs -f frontend-staging
docker-compose -f docker-compose.staging.yml logs -f postgres-staging
```

### Stop Services

```bash
# Stop containers (keeps data)
docker-compose -f docker-compose.staging.yml down

# Stop and remove volumes (WARNING: deletes database)
docker-compose -f docker-compose.staging.yml down -v
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.staging.yml restart

# Restart specific service
docker-compose -f docker-compose.staging.yml restart backend-staging
```

### Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
./scripts/deploy-staging.sh
```

### Database Operations

```bash
# Run migrations
docker exec life-world-os-backend-staging npx prisma migrate deploy

# Seed database
docker exec life-world-os-backend-staging npm run seed

# Open Prisma Studio
docker exec -it life-world-os-backend-staging npx prisma studio --host 0.0.0.0 --port 5555
# Then access at http://localhost:5555

# Connect to database directly
docker exec -it life-world-os-db-staging psql -U lifeworld_staging -d lifeworld_staging
```

### Execute Commands in Containers

```bash
# Backend shell
docker exec -it life-world-os-backend-staging sh

# Frontend shell
docker exec -it life-world-os-frontend-staging sh

# Database shell
docker exec -it life-world-os-db-staging sh
```

## Testing Checklist

After deployment, verify:

- [ ] Frontend loads at http://localhost:5174
- [ ] Backend health check: http://localhost:3002/health
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] Authentication flow works
- [ ] No console errors in browser
- [ ] No errors in container logs

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose -f docker-compose.staging.yml logs backend-staging

# Common issues:
# - Database not ready: Wait longer or check postgres-staging logs
# - Migration errors: Check database connection string
# - Port conflicts: Change port in docker-compose.staging.yml
```

### Frontend Won't Load

```bash
# Check logs
docker-compose -f docker-compose.staging.yml logs frontend-staging

# Verify API URL is correct
docker exec life-world-os-frontend-staging env | grep VITE_API_URL
```

### Database Connection Issues

```bash
# Test database connection
docker exec life-world-os-db-staging pg_isready -U lifeworld_staging

# Check database logs
docker-compose -f docker-compose.staging.yml logs postgres-staging

# Verify environment variables
docker exec life-world-os-backend-staging env | grep DATABASE_URL
```

### Port Conflicts

If ports are already in use:

1. Edit `docker-compose.staging.yml`
2. Change port mappings:
   ```yaml
   ports:
     - "NEW_PORT:CONTAINER_PORT"
   ```
3. Update `.env.staging` with new URLs
4. Redeploy

## Multiple Staging Environments

To run multiple staging environments simultaneously:

1. Copy `docker-compose.staging.yml` to `docker-compose.staging2.yml`
2. Update container names and ports
3. Use different `.env.staging2` file
4. Deploy with: `docker-compose -f docker-compose.staging2.yml up -d`

## Cleanup

### Remove Staging Environment

```bash
# Stop and remove containers
docker-compose -f docker-compose.staging.yml down

# Remove containers and volumes (deletes database)
docker-compose -f docker-compose.staging.yml down -v

# Remove images (optional)
docker rmi life-world-os-backend-staging life-world-os-frontend-staging
```

## Security Notes

⚠️ **Important for Staging:**

- Use different passwords than production
- Don't use production API keys
- Staging data should be test data only
- Don't expose staging to public internet without authentication
- Rotate secrets regularly

## Next Steps

After staging deployment:

1. Run QA test suite
2. Perform smoke tests
3. Test new features
4. Load testing (optional)
5. Security testing (optional)
6. User acceptance testing (optional)

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.staging.yml logs`
- Review this guide
- Check main README.md
- Review error messages in logs

---

**Ready to deploy?** Run `./scripts/deploy-staging.sh` to get started!

